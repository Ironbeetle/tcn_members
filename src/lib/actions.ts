"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { sendPasswordResetEmail } from "./email";
import {
  fnmemberCreateSchema,
  fnmemberUpdateSchema,
  fnmemberQuerySchema,
  profileCreateSchema,
  profileUpdateSchema,
  profileQuerySchema,
  barcodeCreateSchema,
  barcodeUpdateSchema,
  barcodeQuerySchema,
  familyCreateSchema,
  familyUpdateSchema,
  familyQuerySchema,
  userCreateSchema,
  userUpdateSchema,
  userQuerySchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  changePasswordSchema,
  sessionCreateSchema,
  sessionUpdateSchema,
  memberWithRelationsCreateSchema,
  memberWithRelationsUpdateSchema,
  bulkDeleteSchema,
  bulkUpdateSchema,
  bulletinCreateSchema,
  bulletinUpdateSchema,
  bulletinQuerySchema,
  fillableFormCreateSchema,
  fillableFormUpdateSchema,
  fillableFormQuerySchema,
  formSubmissionCreateSchema,
  formSubmissionUpdateSchema,
  formSubmissionQuerySchema,
  type FnmemberCreate,
  type FnmemberUpdate,
  type FnmemberQuery,
  type ProfileCreate,
  type ProfileUpdate,
  type ProfileQuery,
  type BarcodeCreate,
  type BarcodeUpdate,
  type BarcodeQuery,
  type FamilyCreate,
  type FamilyUpdate,
  type FamilyQuery,
  type UserCreate,
  type UserUpdate,
  type UserQuery,
  type Login,
  type PasswordResetRequest,
  type PasswordReset,
  type ChangePassword,
  type SessionCreate,
  type SessionUpdate,
  type MemberWithRelationsCreate,
  type MemberWithRelationsUpdate,
  type BulkDelete,
  type BulkUpdate,
  type BulletinCreate,
  type BulletinUpdate,
  type BulletinQuery,
  type FillableFormCreate,
  type FillableFormUpdate,
  type FillableFormQuery,
  type FormSubmissionCreate,
  type FormSubmissionUpdate,
  type FormSubmissionQuery,
} from "./validation";

const prisma = new PrismaClient();

// Helper function for error handling
type ActionResult<T> = {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
};

// Helper function to handle Prisma errors
function handlePrismaError(error: any): string {
  if (error.code === "P2002") {
    return "A record with this unique field already exists";
  }
  if (error.code === "P2025") {
    return "Record not found";
  }
  if (error.code === "P2003") {
    return "Foreign key constraint failed";
  }
  return error.message || "An unexpected error occurred";
}

// ==================== FNMEMBER ACTIONS ====================

export async function createFnmember(data: FnmemberCreate): Promise<ActionResult<any>> {
  try {
    const validatedData = fnmemberCreateSchema.parse(data);
    
    const fnmember = await prisma.fnmember.create({
      data: validatedData,
      include: {
        profile: true,
        barcode: true,
        family: true,
      },
    });

    revalidatePath("/members");
    return { success: true, data: fnmember };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function updateFnmember(data: FnmemberUpdate): Promise<ActionResult<any>> {
  try {
    const validatedData = fnmemberUpdateSchema.parse(data);
    const { id, ...updateData } = validatedData;
    
    const fnmember = await prisma.fnmember.update({
      where: { id },
      data: updateData,
      include: {
        profile: true,
        barcode: true,
        family: true,
      },
    });

    revalidatePath("/members");
    return { success: true, data: fnmember };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function deleteFnmember(id: string): Promise<ActionResult<void>> {
  try {
    await prisma.fnmember.delete({
      where: { id },
    });

    revalidatePath("/members");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getFnmembers(query?: FnmemberQuery): Promise<ActionResult<any>> {
  try {
    const validatedQuery = fnmemberQuerySchema.parse(query || {});
    const { page, limit, sortBy, sortOrder, ...filters } = validatedQuery;
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (filters.id) where.id = filters.id;
    if (filters.t_number) where.t_number = { contains: filters.t_number, mode: "insensitive" };
    if (filters.first_name) where.first_name = { contains: filters.first_name, mode: "insensitive" };
    if (filters.last_name) where.last_name = { contains: filters.last_name, mode: "insensitive" };
    if (filters.deceased !== undefined) where.deceased = filters.deceased;

    const [fnmembers, total] = await Promise.all([
      prisma.fnmember.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          profile: true,
          barcode: true,
          family: true,
        },
      }),
      prisma.fnmember.count({ where }),
    ]);

    return {
      success: true,
      data: {
        fnmembers,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getFnmemberById(id: string): Promise<ActionResult<any>> {
  try {
    const fnmember = await prisma.fnmember.findUnique({
      where: { id },
      include: {
        profile: true,
        barcode: true,
        family: true,
      },
    });

    if (!fnmember) {
      return { success: false, error: "Member not found" };
    }

    return { success: true, data: fnmember };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

// ==================== PROFILE ACTIONS ====================

export async function createProfile(data: ProfileCreate): Promise<ActionResult<any>> {
  try {
    const validatedData = profileCreateSchema.parse(data);
    
    const profile = await prisma.profile.create({
      data: validatedData,
      include: {
        fnmember: true,
      },
    });

    revalidatePath("/profiles");
    return { success: true, data: profile };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function updateProfile(data: ProfileUpdate): Promise<ActionResult<any>> {
  try {
    const validatedData = profileUpdateSchema.parse(data);
    const { id, ...updateData } = validatedData;
    
    const profile = await prisma.profile.update({
      where: { id },
      data: updateData,
      include: {
        fnmember: true,
      },
    });

    revalidatePath("/profiles");
    return { success: true, data: profile };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function deleteProfile(id: string): Promise<ActionResult<void>> {
  try {
    await prisma.profile.delete({
      where: { id },
    });

    revalidatePath("/profiles");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getProfiles(query?: ProfileQuery): Promise<ActionResult<any>> {
  try {
    const validatedQuery = profileQuerySchema.parse(query || {});
    const { page, limit, ...filters } = validatedQuery;
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (filters.id) where.id = filters.id;
    if (filters.fnmemberId) where.fnmemberId = filters.fnmemberId;
    if (filters.gender) where.gender = filters.gender;
    if (filters.community) where.community = { contains: filters.community, mode: "insensitive" };
    if (filters.email) where.email = { contains: filters.email, mode: "insensitive" };

    const [profiles, total] = await Promise.all([
      prisma.profile.findMany({
        where,
        skip,
        take: limit,
        include: {
          fnmember: true,
        },
      }),
      prisma.profile.count({ where }),
    ]);

    return {
      success: true,
      data: {
        profiles,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

// ==================== BARCODE ACTIONS ====================

export async function createBarcode(data: BarcodeCreate): Promise<ActionResult<any>> {
  try {
    const validatedData = barcodeCreateSchema.parse(data);
    
    const barcode = await prisma.barcode.create({
      data: validatedData,
      include: {
        fnmember: true,
      },
    });

    revalidatePath("/barcodes");
    return { success: true, data: barcode };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function updateBarcode(data: BarcodeUpdate): Promise<ActionResult<any>> {
  try {
    const validatedData = barcodeUpdateSchema.parse(data);
    const { id, ...updateData } = validatedData;
    
    const barcode = await prisma.barcode.update({
      where: { id },
      data: updateData,
      include: {
        fnmember: true,
      },
    });

    revalidatePath("/barcodes");
    return { success: true, data: barcode };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function deleteBarcode(id: string): Promise<ActionResult<void>> {
  try {
    await prisma.barcode.delete({
      where: { id },
    });

    revalidatePath("/barcodes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getBarcodes(query?: BarcodeQuery): Promise<ActionResult<any>> {
  try {
    const validatedQuery = barcodeQuerySchema.parse(query || {});
    const { page, limit, ...filters } = validatedQuery;
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (filters.id) where.id = filters.id;
    if (filters.barcode) where.barcode = { contains: filters.barcode, mode: "insensitive" };
    if (filters.fnmemberId) where.fnmemberId = filters.fnmemberId;
    if (filters.activated !== undefined) where.activated = filters.activated;

    const [barcodes, total] = await Promise.all([
      prisma.barcode.findMany({
        where,
        skip,
        take: limit,
        include: {
          fnmember: true,
        },
      }),
      prisma.barcode.count({ where }),
    ]);

    return {
      success: true,
      data: {
        barcodes,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

// ==================== FAMILY ACTIONS ====================

export async function createFamily(data: FamilyCreate): Promise<ActionResult<any>> {
  try {
    const validatedData = familyCreateSchema.parse(data);
    
    const family = await prisma.family.create({
      data: validatedData,
      include: {
        fnmember: true,
      },
    });

    revalidatePath("/families");
    return { success: true, data: family };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function updateFamily(data: FamilyUpdate): Promise<ActionResult<any>> {
  try {
    const validatedData = familyUpdateSchema.parse(data);
    const { id, ...updateData } = validatedData;
    
    const family = await prisma.family.update({
      where: { id },
      data: updateData,
      include: {
        fnmember: true,
      },
    });

    revalidatePath("/families");
    return { success: true, data: family };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function deleteFamily(id: string): Promise<ActionResult<void>> {
  try {
    await prisma.family.delete({
      where: { id },
    });

    revalidatePath("/families");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getFamilies(query?: FamilyQuery): Promise<ActionResult<any>> {
  try {
    const validatedQuery = familyQuerySchema.parse(query || {});
    const { page, limit, ...filters } = validatedQuery;
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (filters.id) where.id = filters.id;
    if (filters.fnmemberId) where.fnmemberId = filters.fnmemberId;
    if (filters.dependents !== undefined) where.dependents = filters.dependents;

    const [families, total] = await Promise.all([
      prisma.family.findMany({
        where,
        skip,
        take: limit,
        include: {
          fnmember: true,
        },
      }),
      prisma.family.count({ where }),
    ]);

    return {
      success: true,
      data: {
        families,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

// ==================== USER ACTIONS ====================

export async function createUser(data: UserCreate): Promise<ActionResult<any>> {
  try {
    const validatedData = userCreateSchema.parse(data);
    
    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);
    
    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        department: true,
        role: true,
        created: true,
      },
    });

    revalidatePath("/users");
    return { success: true, data: user };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function updateUser(data: UserUpdate): Promise<ActionResult<any>> {
  try {
    const validatedData = userUpdateSchema.parse(data);
    const { id, password, ...updateData } = validatedData;
    
    // Hash password if provided
    const finalUpdateData: any = { ...updateData };
    if (password) {
      finalUpdateData.password = await bcrypt.hash(password, 12);
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: finalUpdateData,
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        department: true,
        role: true,
        created: true,
      },
    });

    revalidatePath("/users");
    return { success: true, data: user };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function deleteUser(id: string): Promise<ActionResult<void>> {
  try {
    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getUsers(query?: UserQuery): Promise<ActionResult<any>> {
  try {
    const validatedQuery = userQuerySchema.parse(query || {});
    const { page, limit, sortBy, sortOrder, ...filters } = validatedQuery;
    
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (filters.id) where.id = filters.id;
    if (filters.email) where.email = { contains: filters.email, mode: "insensitive" };
    if (filters.department) where.department = filters.department;
    if (filters.role) where.role = filters.role;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true,
          department: true,
          role: true,
          created: true,
          lastLogin: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      success: true,
      data: {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

// ==================== AUTHENTICATION ACTIONS ====================

export async function loginUser(data: Login): Promise<ActionResult<any>> {
  try {
    const validatedData = loginSchema.parse(data);
    
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      return { success: false, error: "Invalid credentials" };
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      return { success: false, error: "Account is temporarily locked" };
    }

    const isValidPassword = await bcrypt.compare(validatedData.password, user.password);

    if (!isValidPassword) {
      // Increment login attempts
      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: user.loginAttempts + 1,
          lockedUntil: user.loginAttempts >= 4 ? new Date(Date.now() + 15 * 60 * 1000) : null, // Lock for 15 minutes after 5 attempts
        },
      });
      return { success: false, error: "Invalid credentials" };
    }

    // Reset login attempts and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLogin: new Date(),
      },
    });

    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        department: user.department,
        role: user.role,
      },
    };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function requestPasswordReset(data: PasswordResetRequest): Promise<ActionResult<void>> {
  try {
    const validatedData = passwordResetRequestSchema.parse(data);
    
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user) {
      // Don't reveal if user exists
      return { success: true };
    }

    // Generate 4-digit PIN
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const pinExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.user.update({
      where: { id: user.id },
      data: {
        pin,
        pinExpiresAt,
        passwordResetRequested: new Date(),
      },
    });

    // Send PIN via email
    console.log('[Password Reset] Sending PIN to user:', user.email);
    const emailResult = await sendPasswordResetEmail(user.email, pin);
    
    if (!emailResult.success) {
      console.error('[Password Reset] Failed to send password reset email:', emailResult.error);
      // Still return success to not reveal if user exists, but log the error
    } else {
      console.log('[Password Reset] PIN email sent successfully to:', user.email);
    }

    return { success: true };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function resetPassword(data: PasswordReset): Promise<ActionResult<void>> {
  try {
    const validatedData = passwordResetSchema.parse(data);
    
    const user = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (!user || !user.pin || !user.pinExpiresAt) {
      return { success: false, error: "Invalid reset request" };
    }

    if (user.pinExpiresAt < new Date()) {
      return { success: false, error: "PIN has expired" };
    }

    if (user.pin !== validatedData.pin) {
      return { success: false, error: "Invalid PIN" };
    }

    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        pin: null,
        pinExpiresAt: null,
        passwordResetCompleted: new Date(),
        loginAttempts: 0,
        lockedUntil: null,
      },
    });

    return { success: true };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function changePassword(userId: string, data: ChangePassword): Promise<ActionResult<void>> {
  try {
    const validatedData = changePasswordSchema.parse(data);
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const isValidPassword = await bcrypt.compare(validatedData.currentPassword, user.password);

    if (!isValidPassword) {
      return { success: false, error: "Current password is incorrect" };
    }

    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return { success: true };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

// ==================== COMBINED OPERATIONS ====================

export async function createMemberWithRelations(data: MemberWithRelationsCreate): Promise<ActionResult<any>> {
  try {
    const validatedData = memberWithRelationsCreateSchema.parse(data);
    
    const result = await prisma.$transaction(async (tx) => {
      // Create member
      const member = await tx.fnmember.create({
        data: validatedData.member,
      });

      // Create profile if provided
      let profile = null;
      if (validatedData.profile) {
        profile = await tx.profile.create({
          data: {
            ...validatedData.profile,
            fnmemberId: member.id,
          },
        });
      }

      // Create barcodes if provided
      let barcodes = [];
      if (validatedData.barcodes && validatedData.barcodes.length > 0) {
        for (const barcodeData of validatedData.barcodes) {
          const barcode = await tx.barcode.create({
            data: {
              ...barcodeData,
              fnmemberId: member.id,
            },
          });
          barcodes.push(barcode);
        }
      }

      // Create family if provided
      let family = null;
      if (validatedData.family) {
        family = await tx.family.create({
          data: {
            ...validatedData.family,
            fnmemberId: member.id,
          },
        });
      }

      return {
        member,
        profile,
        barcodes,
        family,
      };
    });

    revalidatePath("/members");
    return { success: true, data: result };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function updateMemberWithRelations(memberId: string, data: MemberWithRelationsUpdate): Promise<ActionResult<any>> {
  try {
    const validatedData = memberWithRelationsUpdateSchema.parse(data);
    
    const result = await prisma.$transaction(async (tx) => {
      let member = null;
      let profile = null;
      let barcodes: never[] = [];
      let family = null;

      // Update member if data provided
      if (validatedData.member) {
        const { id, ...memberData } = validatedData.member;
        member = await tx.fnmember.update({
          where: { id: memberId },
          data: memberData,
        });
      }

      // Update profile if data provided
      if (validatedData.profile) {
        const existingProfile = await tx.profile.findFirst({
          where: { fnmemberId: memberId },
        });

        if (existingProfile) {
          const { id, ...profileData } = validatedData.profile;
          profile = await tx.profile.update({
            where: { id: existingProfile.id },
            data: profileData,
          });
        } else {
          const { id, ...profileCreateData } = validatedData.profile;
          // Filter out undefined values to match Prisma's requirements
          const filteredProfileData = Object.fromEntries(
            Object.entries(profileCreateData).filter(([_, value]) => value !== undefined)
          );
          profile = await tx.profile.create({
            data: {
              ...filteredProfileData,
              fnmemberId: memberId,
            } as any,
          });
        }
      }

      // Update family if data provided
      if (validatedData.family) {
        const existingFamily = await tx.family.findFirst({
          where: { fnmemberId: memberId },
        });

        if (existingFamily) {
          const { id, ...familyData } = validatedData.family;
          family = await tx.family.update({
            where: { id: existingFamily.id },
            data: familyData,
          });
        } else {
          family = await tx.family.create({
            data: {
              ...validatedData.family,
              fnmemberId: memberId,
            },
          });
        }
      }

      return {
        member,
        profile,
        barcodes,
        family,
      };
    });

    revalidatePath("/members");
    return { success: true, data: result };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

// ==================== BULK OPERATIONS ====================

export async function bulkDeleteRecords(table: string, data: BulkDelete): Promise<ActionResult<void>> {
  try {
    const validatedData = bulkDeleteSchema.parse(data);
    
    const validTables = ["fnmember", "profile", "barcode", "family", "user"];
    if (!validTables.includes(table)) {
      return { success: false, error: "Invalid table name" };
    }

    await (prisma as any)[table].deleteMany({
      where: {
        id: {
          in: validatedData.ids,
        },
      },
    });

    revalidatePath(`/${table}s`);
    return { success: true };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function bulkUpdateRecords(table: string, data: BulkUpdate): Promise<ActionResult<void>> {
  try {
    const validatedData = bulkUpdateSchema.parse(data);
    
    const validTables = ["fnmember", "profile", "barcode", "family", "user"];
    if (!validTables.includes(table)) {
      return { success: false, error: "Invalid table name" };
    }

    await (prisma as any)[table].updateMany({
      where: {
        id: {
          in: validatedData.ids,
        },
      },
      data: validatedData.data,
    });

    revalidatePath(`/${table}s`);
    return { success: true };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

// ==================== SESSION ACTIONS ====================

export async function createSession(data: SessionCreate): Promise<ActionResult<any>> {
  try {
    const validatedData = sessionCreateSchema.parse(data);
    
    const session = await prisma.session.create({
      data: validatedData,
    });

    return { success: true, data: session };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function deleteSession(sessionToken: string): Promise<ActionResult<void>> {
  try {
    await prisma.session.delete({
      where: { sessionToken },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function cleanupExpiredSessions(): Promise<ActionResult<void>> {
  try {
    await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

// ==================== BULLETIN ACTIONS ====================

export async function createBulletin(data: BulletinCreate): Promise<ActionResult<any>> {
  try {
    const validatedData = bulletinCreateSchema.parse(data);
    
    const bulletin = await prisma.bulletin.create({
      data: validatedData,
    });

    revalidatePath("/TCN_BulletinBoard");
    revalidatePath("/TCN_Home");
    return { success: true, data: bulletin };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function updateBulletin(data: BulletinUpdate): Promise<ActionResult<any>> {
  try {
    const validatedData = bulletinUpdateSchema.parse(data);
    const { id, ...updateData } = validatedData;

    const bulletin = await prisma.bulletin.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/TCN_BulletinBoard");
    revalidatePath("/TCN_Home");
    return { success: true, data: bulletin };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function deleteBulletin(id: string): Promise<ActionResult<void>> {
  try {
    await prisma.bulletin.delete({
      where: { id },
    });

    revalidatePath("/TCN_BulletinBoard");
    revalidatePath("/TCN_Home");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getBulletin(id: string): Promise<ActionResult<any>> {
  try {
    const bulletin = await prisma.bulletin.findUnique({
      where: { id },
    });

    if (!bulletin) {
      return { success: false, error: "Bulletin not found" };
    }

    return { success: true, data: bulletin };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function queryBulletins(params: BulletinQuery = {}): Promise<ActionResult<any>> {
  try {
    const validatedParams = bulletinQuerySchema.parse(params);
    const { page, limit, sortBy, sortOrder, category, searchTerm } = validatedParams;

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    
    if (category) {
      where.category = category;
    }

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { subject: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [bulletins, total] = await Promise.all([
      prisma.bulletin.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.bulletin.count({ where }),
    ]);

    return {
      success: true,
      data: {
        bulletins,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    if (error.name === "ZodError") {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getLatestBulletins(limit: number = 5): Promise<ActionResult<any>> {
  try {
    const bulletins = await prisma.bulletin.findMany({
      take: limit,
      orderBy: { created: 'desc' },
    });

    return { success: true, data: bulletins };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getBulletinsByCategory(category: string, limit: number = 10): Promise<ActionResult<any>> {
  try {
    const bulletins = await prisma.bulletin.findMany({
      where: { category: category as any },
      take: limit,
      orderBy: { created: 'desc' },
    });

    return { success: true, data: bulletins };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

// ==================== PROFILE IMAGE ACTIONS ====================

export async function uploadProfileImage(memberId: string, formData: FormData): Promise<ActionResult<{ imageUrl: string }>> {
  try {
    const { writeFile, mkdir, unlink } = await import('fs/promises');
    const { existsSync } = await import('fs');
    const path = await import('path');
    const sharp = await import('sharp');

    const file = formData.get('image') as File;
    
    if (!file) {
      return { success: false, error: 'No image file provided' };
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' };
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return { success: false, error: 'File size exceeds 5MB limit' };
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image with sharp: resize and optimize
    const processedImage = await sharp.default(buffer)
      .resize(300, 300, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toBuffer();

    // Create member-specific directory
    const memberDir = path.join(process.cwd(), 'public', 'profiles', memberId);
    
    if (!existsSync(memberDir)) {
      await mkdir(memberDir, { recursive: true });
    }

    // Delete old image if exists
    const oldImagePath = path.join(memberDir, 'avatar.jpg');
    if (existsSync(oldImagePath)) {
      await unlink(oldImagePath);
    }

    // Save new image
    const imagePath = path.join(memberDir, 'avatar.jpg');
    await writeFile(imagePath, processedImage);

    // Update database with image URL
    const imageUrl = `/profiles/${memberId}/avatar.jpg?t=${Date.now()}`;
    
    await prisma.profile.updateMany({
      where: {
        fnmemberId: memberId
      },
      data: {
        image_url: imageUrl
      }
    });

    revalidatePath('/Member_Account');

    return {
      success: true,
      data: { imageUrl }
    };

  } catch (error: any) {
    console.error('Error uploading profile image:', error);
    return { success: false, error: 'Failed to upload image' };
  }
}

export async function deleteProfileImage(memberId: string): Promise<ActionResult<void>> {
  try {
    const { unlink } = await import('fs/promises');
    const { existsSync } = await import('fs');
    const path = await import('path');

    // Delete image file
    const imagePath = path.join(
      process.cwd(), 
      'public', 
      'profiles', 
      memberId, 
      'avatar.jpg'
    );
    
    if (existsSync(imagePath)) {
      await unlink(imagePath);
    }

    // Update database to remove image URL
    await prisma.profile.updateMany({
      where: {
        fnmemberId: memberId
      },
      data: {
        image_url: null
      }
    });

    revalidatePath('/Member_Account');

    return { success: true };

  } catch (error: any) {
    console.error('Error deleting profile image:', error);
    return { success: false, error: 'Failed to delete image' };
  }
}

// ==================== FILLABLE FORM ACTIONS ====================

export async function createFillableForm(data: FillableFormCreate): Promise<ActionResult<any>> {
  try {
    const validatedData = fillableFormCreateSchema.parse(data);
    
    const form = await prisma.fillable_form.create({
      data: validatedData,
    });

    revalidatePath('/TCN_Forms');
    return { success: true, data: form };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function updateFillableForm(data: FillableFormUpdate): Promise<ActionResult<any>> {
  try {
    const validatedData = fillableFormUpdateSchema.parse(data);
    const { id, ...updateData } = validatedData;

    const form = await prisma.fillable_form.update({
      where: { id },
      data: updateData,
    });

    revalidatePath('/TCN_Forms');
    return { success: true, data: form };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function deleteFillableForm(id: string): Promise<ActionResult<void>> {
  try {
    await prisma.fillable_form.delete({
      where: { id },
    });

    revalidatePath('/TCN_Forms');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function queryFillableForms(query?: FillableFormQuery): Promise<ActionResult<any>> {
  try {
    const validatedQuery = fillableFormQuerySchema.parse(query || {});
    const { id, category, is_active, searchTerm, page, limit, sortBy, sortOrder } = validatedQuery;

    const where: any = {};
    if (id) where.id = id;
    if (category) where.category = category;
    if (is_active !== undefined) where.is_active = is_active;
    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [forms, total] = await Promise.all([
      prisma.fillable_form.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      prisma.fillable_form.count({ where }),
    ]);

    return {
      success: true,
      data: {
        forms,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getFillableFormById(id: string): Promise<ActionResult<any>> {
  try {
    const form = await prisma.fillable_form.findUnique({
      where: { id },
      include: {
        submissions: {
          orderBy: { created: 'desc' },
          take: 10,
        },
      },
    });

    if (!form) {
      return { success: false, error: 'Form not found' };
    }

    return { success: true, data: form };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

// ==================== FORM SUBMISSION ACTIONS ====================

export async function createFormSubmission(data: FormSubmissionCreate): Promise<ActionResult<any>> {
  try {
    const validatedData = formSubmissionCreateSchema.parse(data);
    
    const submission = await prisma.form_submission.create({
      data: {
        ...validatedData,
        status: 'PENDING',
      },
      include: {
        form: true,
      },
    });

    revalidatePath('/TCN_Forms');
    return { success: true, data: submission };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function updateFormSubmission(data: FormSubmissionUpdate): Promise<ActionResult<any>> {
  try {
    const validatedData = formSubmissionUpdateSchema.parse(data);
    const { id, ...updateData } = validatedData;

    const submission = await prisma.form_submission.update({
      where: { id },
      data: updateData,
      include: {
        form: true,
      },
    });

    revalidatePath('/TCN_Forms');
    return { success: true, data: submission };
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return { success: false, errors: error.flatten().fieldErrors };
    }
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function submitFormAndGeneratePDF(
  submissionId: string
): Promise<ActionResult<{ filled_pdf_url: string }>> {
  try {
    const { PDFDocument } = await import('pdf-lib');
    const { readFile, writeFile, mkdir } = await import('fs/promises');
    const { existsSync } = await import('fs');
    const path = await import('path');

    // Get the submission with form data
    const submission = await prisma.form_submission.findUnique({
      where: { id: submissionId },
      include: {
        form: true,
        fnmember: true,
      },
    });

    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    // Load the PDF template
    const pdfPath = path.join(process.cwd(), 'public', submission.form.pdf_url);
    const pdfBytes = await readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Get the form from the PDF
    const form = pdfDoc.getForm();
    const formData = submission.form_data as Record<string, any>;
    const formFields = submission.form.form_fields as any[];

    // Fill in the PDF fields
    for (const field of formFields) {
      const value = formData[field.name];
      if (value === undefined || value === null) continue;

      const pdfFieldName = field.pdfFieldName || field.name;
      
      try {
        switch (field.type) {
          case 'text':
          case 'textarea':
          case 'email':
          case 'phone':
          case 'number':
            const textField = form.getTextField(pdfFieldName);
            textField.setText(String(value));
            break;
          case 'checkbox':
            const checkBox = form.getCheckBox(pdfFieldName);
            if (value) checkBox.check();
            else checkBox.uncheck();
            break;
          case 'select':
          case 'radio':
            const dropdown = form.getDropdown(pdfFieldName);
            dropdown.select(String(value));
            break;
          case 'date':
            const dateField = form.getTextField(pdfFieldName);
            dateField.setText(new Date(value).toLocaleDateString());
            break;
        }
      } catch (e) {
        console.warn(`Could not fill field ${pdfFieldName}:`, e);
      }
    }

    // Flatten the form so fields can't be edited
    form.flatten();

    // Save the filled PDF
    const filledPdfBytes = await pdfDoc.save();
    
    // Create directory for filled PDFs
    const filledPdfDir = path.join(process.cwd(), 'public', 'filled-forms', submission.fnmemberId);
    if (!existsSync(filledPdfDir)) {
      await mkdir(filledPdfDir, { recursive: true });
    }

    const filledPdfFileName = `${submission.form.title.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
    const filledPdfPath = path.join(filledPdfDir, filledPdfFileName);
    await writeFile(filledPdfPath, filledPdfBytes);

    const filled_pdf_url = `/filled-forms/${submission.fnmemberId}/${filledPdfFileName}`;

    // Update the submission
    await prisma.form_submission.update({
      where: { id: submissionId },
      data: {
        filled_pdf_url,
        status: 'SUBMITTED',
      },
    });

    revalidatePath('/TCN_Forms');
    return { success: true, data: { filled_pdf_url } };
  } catch (error: any) {
    console.error('Error generating PDF:', error);
    return { success: false, error: 'Failed to generate PDF' };
  }
}

export async function queryFormSubmissions(query?: FormSubmissionQuery): Promise<ActionResult<any>> {
  try {
    const validatedQuery = formSubmissionQuerySchema.parse(query || {});
    const { id, formId, fnmemberId, status, page, limit, sortBy, sortOrder } = validatedQuery;

    const where: any = {};
    if (id) where.id = id;
    if (formId) where.formId = formId;
    if (fnmemberId) where.fnmemberId = fnmemberId;
    if (status) where.status = status;

    const [submissions, total] = await Promise.all([
      prisma.form_submission.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          form: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
        },
      }),
      prisma.form_submission.count({ where }),
    ]);

    return {
      success: true,
      data: {
        submissions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getMemberFormSubmissions(fnmemberId: string): Promise<ActionResult<any>> {
  try {
    const submissions = await prisma.form_submission.findMany({
      where: { fnmemberId },
      orderBy: { created: 'desc' },
      include: {
        form: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    });

    return { success: true, data: submissions };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}