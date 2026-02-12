"use server";

import { PrismaClient } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { unstable_noStore as noStore } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
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
    
    // Check if profile already exists for this member to prevent duplicates
    let profile;
    if (validatedData.fnmemberId) {
      const existingProfile = await prisma.profile.findFirst({
        where: { fnmemberId: validatedData.fnmemberId },
      });
      
      if (existingProfile) {
        // Update existing profile instead of creating duplicate
        const { fnmemberId, ...updateData } = validatedData;
        profile = await prisma.profile.update({
          where: { id: existingProfile.id },
          data: updateData,
          include: {
            fnmember: true,
          },
        });
      } else {
        // Create new profile
        profile = await prisma.profile.create({
          data: validatedData,
          include: {
            fnmember: true,
          },
        });
      }
    } else {
      // No fnmemberId provided, create normally
      profile = await prisma.profile.create({
        data: validatedData,
        include: {
          fnmember: true,
        },
      });
    }

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
    
    // Check if family already exists for this member to prevent duplicates
    let family;
    if (validatedData.fnmemberId) {
      const existingFamily = await prisma.family.findFirst({
        where: { fnmemberId: validatedData.fnmemberId },
      });
      
      if (existingFamily) {
        // Update existing family instead of creating duplicate
        const { fnmemberId, ...updateData } = validatedData;
        family = await prisma.family.update({
          where: { id: existingFamily.id },
          data: updateData,
          include: {
            fnmember: true,
          },
        });
      } else {
        // Create new family
        family = await prisma.family.create({
          data: validatedData,
          include: {
            fnmember: true,
          },
        });
      }
    } else {
      // No fnmemberId provided, create normally
      family = await prisma.family.create({
        data: validatedData,
        include: {
          fnmember: true,
        },
      });
    }

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

// ==================== BULLETIN ACTIONS ====================

export async function createBulletin(data: BulletinCreate): Promise<ActionResult<any>> {
  try {
    const validatedData = bulletinCreateSchema.parse(data);
    
    // Filter out undefined values to match Prisma's requirements
    const createData = Object.fromEntries(
      Object.entries(validatedData).filter(([_, value]) => value !== undefined)
    );
    
    const bulletin = await prisma.bulletin.create({
      data: createData as any,
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

export async function queryBulletins(params: Partial<BulletinQuery> = {}): Promise<ActionResult<any>> {
  // Prevent Next.js from caching this response - bulletins change frequently
  noStore();
  
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

// ==================== CHIEF & COUNCIL ACTIONS ====================

export async function getChiefAndCouncil(): Promise<ActionResult<any>> {
  try {
    // First, get the current council
    const currentCouncil = await prisma.current_Council.findFirst({
      orderBy: { created: 'desc' },
      include: {
        members: {
          orderBy: [
            { position: 'asc' },  // CHIEF comes before COUNCILLOR alphabetically
            { last_name: 'asc' },
          ],
        },
      },
    });

    if (!currentCouncil) {
      return { success: true, data: { council: null, members: [] } };
    }

    return { 
      success: true, 
      data: {
        council: {
          id: currentCouncil.id,
          council_start: currentCouncil.council_start,
          council_end: currentCouncil.council_end,
        },
        members: currentCouncil.members,
      }
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getChief(): Promise<ActionResult<any>> {
  try {
    const chief = await prisma.council_Member.findFirst({
      where: { position: 'CHIEF' },
    });

    return { success: true, data: chief };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getCouncillors(): Promise<ActionResult<any>> {
  try {
    const councillors = await prisma.council_Member.findMany({
      where: { position: 'COUNCILLOR' },
      orderBy: { last_name: 'asc' },
    });

    return { success: true, data: councillors };
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

    // Update or create profile record with image URL
    const imageUrl = `/profiles/${memberId}/avatar.jpg?t=${Date.now()}`;

    const existingProfile = await prisma.profile.findFirst({ where: { fnmemberId: memberId } });
    if (existingProfile) {
      await prisma.profile.update({
        where: { id: existingProfile.id },
        data: { image_url: imageUrl }
      });
    } else {
      await prisma.profile.create({
        data: {
          fnmemberId: memberId,
          image_url: imageUrl,
          o_r_status: 'On Reserve',
          community: '',
          address: '',
          phone_number: '',
          email: ''
        }
      });
    }

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
        formId: validatedData.formId,
        fnmemberId: validatedData.fnmemberId,
        form_data: validatedData.form_data as any,
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
      data: updateData as any,
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

// ==================== MEMBERSHIP STATS ACTIONS ====================

export async function getMembershipStats(): Promise<ActionResult<{
  totalMembers: number;
  activatedMembers: number;
  pendingMembers: number;
  noneMembers: number;
}>> {
  try {
    const [totalMembers, activatedMembers, pendingMembers] = await Promise.all([
      prisma.fnmember.count(),
      prisma.fnmember.count({
        where: { activated: 'ACTIVATED' }
      }),
      prisma.fnmember.count({
        where: { activated: 'PENDING' }
      }),
    ]);

    const noneMembers = totalMembers - activatedMembers - pendingMembers;

    return {
      success: true,
      data: {
        totalMembers,
        activatedMembers,
        pendingMembers,
        noneMembers,
      },
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

// ==================== SIGNUP FORM ACTIONS ====================

// Types for signup forms
type SignupFormField = {
  fieldId: string;
  label: string;
  fieldType: 'TEXT' | 'TEXTAREA' | 'EMAIL' | 'PHONE' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT' | 'CHECKBOX';
  required: boolean;
  order: number;
  placeholder?: string;
  options?: string[];
};

type SignupForm = {
  id: string;
  tcn_form_id: string;
  title: string;
  description: string | null;
  deadline: Date | null;
  max_entries: number | null;
  is_active: boolean;
  category: string;
  created_by: string | null;
  fields: SignupFormField[];
  created: Date;
  updated: Date;
  submissionCount?: number;
  hasUserSubmitted?: boolean;
};

export async function getActiveSignupForm(): Promise<ActionResult<SignupForm | null>> {
  try {
    const form = await prisma.signup_form.findFirst({
      where: {
        is_active: true,
        OR: [
          { deadline: null },
          { deadline: { gte: new Date() } }
        ]
      },
      include: {
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { created: 'desc' },
    });

    if (!form) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        ...form,
        fields: form.fields as SignupFormField[],
        submissionCount: form._count.submissions,
      },
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getSignupFormById(tcnFormId: string): Promise<ActionResult<SignupForm | null>> {
  try {
    const form = await prisma.signup_form.findUnique({
      where: { tcn_form_id: tcnFormId },
      include: {
        _count: {
          select: { submissions: true }
        }
      },
    });

    if (!form) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        ...form,
        fields: form.fields as SignupFormField[],
        submissionCount: form._count.submissions,
      },
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function checkUserSubmission(tcnFormId: string, memberId: string): Promise<ActionResult<{ hasSubmitted: boolean; submittedAt?: Date }>> {
  try {
    const form = await prisma.signup_form.findUnique({
      where: { tcn_form_id: tcnFormId },
    });

    if (!form) {
      return { success: false, error: 'Form not found' };
    }

    const submission = await prisma.signup_submission.findUnique({
      where: {
        formId_fnmemberId: {
          formId: form.id,
          fnmemberId: memberId,
        }
      }
    });

    return {
      success: true,
      data: {
        hasSubmitted: !!submission,
        submittedAt: submission?.created,
      },
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function submitSignupForm(
  tcnFormId: string,
  memberId: string,
  responses: Record<string, any>
): Promise<ActionResult<{ submissionId: string; webhookSynced: boolean }>> {
  try {
    // Get the form
    const form = await prisma.signup_form.findUnique({
      where: { tcn_form_id: tcnFormId },
      include: {
        _count: {
          select: { submissions: true }
        }
      }
    });

    if (!form) {
      return { success: false, error: 'Form not found' };
    }

    // Validate form is still accepting submissions
    if (!form.is_active) {
      return { success: false, error: 'This form is no longer accepting submissions' };
    }

    if (form.deadline && new Date(form.deadline) < new Date()) {
      return { success: false, error: 'The deadline for this form has passed' };
    }

    if (form.max_entries && form._count.submissions >= form.max_entries) {
      return { success: false, error: 'This form has reached its maximum number of entries' };
    }

    // Check for existing submission
    const existingSubmission = await prisma.signup_submission.findUnique({
      where: {
        formId_fnmemberId: {
          formId: form.id,
          fnmemberId: memberId,
        }
      }
    });

    if (existingSubmission) {
      return { success: false, error: 'You have already submitted this form' };
    }

    // Get member info for webhook
    const member = await prisma.fnmember.findUnique({
      where: { id: memberId },
      include: { profile: true }
    });

    if (!member) {
      return { success: false, error: 'Member not found' };
    }

    // Create the submission
    const submission = await prisma.signup_submission.create({
      data: {
        formId: form.id,
        fnmemberId: memberId,
        responses,
      },
    });

    // Send webhook to TCN_COMM
    let webhookSuccess = false;
    const webhookUrl = process.env.TCN_COMM_WEBHOOK_URL;
    const webhookApiKey = process.env.TCN_COMM_API_KEY;

    if (webhookUrl && webhookApiKey) {
      try {
        const profile = member.profile?.[0];
        
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': webhookApiKey,
          },
          body: JSON.stringify({
            formId: form.tcn_form_id,
            submittedAt: submission.created.toISOString(),
            submitter: {
              memberId: member.t_number,
              name: `${member.first_name} ${member.last_name}`,
              email: profile?.email || '',
              phone: profile?.phone_number || '',
            },
            responses,
          }),
        });

        if (webhookResponse.ok) {
          webhookSuccess = true;
          await prisma.signup_submission.update({
            where: { id: submission.id },
            data: { synced_to_tcn: true },
          });
        } else {
          const errorData = await webhookResponse.json().catch(() => ({}));
          await prisma.signup_submission.update({
            where: { id: submission.id },
            data: {
              sync_attempts: 1,
              last_sync_error: errorData.error || `HTTP ${webhookResponse.status}`,
            },
          });
        }
      } catch (err: any) {
        await prisma.signup_submission.update({
          where: { id: submission.id },
          data: {
            sync_attempts: 1,
            last_sync_error: err.message,
          },
        });
      }
    }

    return {
      success: true,
      data: {
        submissionId: submission.id,
        webhookSynced: webhookSuccess,
      },
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

export async function getUserSignupSubmissions(memberId: string): Promise<ActionResult<any[]>> {
  try {
    const submissions = await prisma.signup_submission.findMany({
      where: { fnmemberId: memberId },
      include: {
        form: {
          select: {
            id: true,
            tcn_form_id: true,
            title: true,
            category: true,
            deadline: true,
            allow_resubmit: true,
            fields: true,
          }
        },
        history: {
          orderBy: { created: 'desc' },
          take: 5, // Last 5 submissions
        },
      },
      orderBy: { created: 'desc' },
    });

    return {
      success: true,
      data: submissions,
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

// Get all signup forms grouped by category
export async function getAllSignupForms(memberId?: string): Promise<ActionResult<any>> {
  try {
    const forms = await prisma.signup_form.findMany({
      where: { is_active: true },
      include: {
        _count: { select: { submissions: true } },
      },
      orderBy: [
        { deadline: 'asc' },
        { created: 'desc' },
      ],
    });

    // If memberId provided, also check which forms user has submitted
    let userSubmissions: string[] = [];
    if (memberId) {
      const submissions = await prisma.signup_submission.findMany({
        where: { fnmemberId: memberId },
        select: { formId: true },
      });
      userSubmissions = submissions.map(s => s.formId);
    }

    // Group forms by category
    const formsByCategory = forms.reduce((acc: Record<string, any[]>, form) => {
      const category = form.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push({
        ...form,
        fields: form.fields as SignupFormField[],
        submissionCount: form._count.submissions,
        hasUserSubmitted: userSubmissions.includes(form.id),
      });
      return acc;
    }, {});

    // Get unique categories
    const categories = [...new Set(forms.map(f => f.category))];

    return {
      success: true,
      data: {
        forms: formsByCategory,
        categories,
        totalForms: forms.length,
      },
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

// Get forms by specific category
export async function getSignupFormsByCategory(
  category: string, 
  memberId?: string
): Promise<ActionResult<any[]>> {
  try {
    const forms = await prisma.signup_form.findMany({
      where: { 
        is_active: true,
        category: category as any, 
      },
      include: {
        _count: { select: { submissions: true } },
      },
      orderBy: [
        { deadline: 'asc' },
        { created: 'desc' },
      ],
    });

    // Check user submissions if memberId provided
    let userSubmissions: string[] = [];
    if (memberId) {
      const submissions = await prisma.signup_submission.findMany({
        where: { fnmemberId: memberId },
        select: { formId: true },
      });
      userSubmissions = submissions.map(s => s.formId);
    }

    const result = forms.map(form => ({
      ...form,
      fields: form.fields as SignupFormField[],
      submissionCount: form._count.submissions,
      hasUserSubmitted: userSubmissions.includes(form.id),
    }));

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

// Get user's submission for a specific form (for editing)
export async function getUserSubmissionForForm(
  tcnFormId: string, 
  memberId: string
): Promise<ActionResult<any>> {
  try {
    const form = await prisma.signup_form.findUnique({
      where: { tcn_form_id: tcnFormId },
    });

    if (!form) {
      return { success: false, error: 'Form not found' };
    }

    const submission = await prisma.signup_submission.findUnique({
      where: {
        formId_fnmemberId: {
          formId: form.id,
          fnmemberId: memberId,
        }
      },
      include: {
        form: true,
        history: {
          orderBy: { created: 'desc' },
        },
      },
    });

    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    return {
      success: true,
      data: {
        ...submission,
        form: {
          ...submission.form,
          fields: submission.form.fields as SignupFormField[],
        },
        submissionCount: submission.history.length + 1, // +1 for original
      },
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

// Update/resubmit a signup form
export async function resubmitSignupForm(
  tcnFormId: string,
  memberId: string,
  responses: Record<string, any>
): Promise<ActionResult<{ submissionId: string; cycle: number; webhookSynced: boolean }>> {
  try {
    // Get the form
    const form = await prisma.signup_form.findUnique({
      where: { tcn_form_id: tcnFormId },
    });

    if (!form) {
      return { success: false, error: 'Form not found' };
    }

    if (!form.allow_resubmit) {
      return { success: false, error: 'This form does not allow resubmissions' };
    }

    // Check form is still accepting submissions
    if (!form.is_active) {
      return { success: false, error: 'This form is no longer accepting submissions' };
    }

    if (form.deadline && new Date(form.deadline) < new Date()) {
      return { success: false, error: 'The deadline for this form has passed' };
    }

    // Get existing submission
    const existingSubmission = await prisma.signup_submission.findUnique({
      where: {
        formId_fnmemberId: {
          formId: form.id,
          fnmemberId: memberId,
        }
      },
      include: {
        history: {
          orderBy: { submission_cycle: 'desc' },
          take: 1,
        },
      },
    });

    if (!existingSubmission) {
      return { success: false, error: 'No previous submission found. Please submit the form first.' };
    }

    // Calculate next cycle number
    const lastCycle = existingSubmission.history[0]?.submission_cycle || 1;
    const nextCycle = lastCycle + 1;

    // Archive current responses to history before updating
    await prisma.signup_submission_history.create({
      data: {
        submissionId: existingSubmission.id,
        responses: existingSubmission.responses ?? {},
        submission_cycle: lastCycle,
        synced_to_tcn: existingSubmission.synced_to_tcn,
        status: existingSubmission.status,
      },
    });

    // Update the main submission with new responses
    const updatedSubmission = await prisma.signup_submission.update({
      where: { id: existingSubmission.id },
      data: {
        responses,
        updated: new Date(),
        synced_to_tcn: false,
        sync_attempts: 0,
        last_sync_error: null,
        status: 'SUBMITTED',
      },
    });

    // Send webhook to TCN_COMM for the update
    let webhookSuccess = false;
    const webhookUrl = process.env.TCN_COMM_WEBHOOK_URL;
    const webhookApiKey = process.env.TCN_COMM_API_KEY;

    if (webhookUrl && webhookApiKey) {
      try {
        const member = await prisma.fnmember.findUnique({
          where: { id: memberId },
          include: { profile: true },
        });

        if (member) {
          const profile = member.profile?.[0];
          
          const webhookResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': webhookApiKey,
            },
            body: JSON.stringify({
              formId: form.tcn_form_id,
              submittedAt: updatedSubmission.updated.toISOString(),
              isResubmission: true,
              submissionCycle: nextCycle,
              submitter: {
                memberId: member.t_number,
                name: `${member.first_name} ${member.last_name}`,
                email: profile?.email || '',
                phone: profile?.phone_number || '',
              },
              responses,
            }),
          });

          if (webhookResponse.ok) {
            webhookSuccess = true;
            await prisma.signup_submission.update({
              where: { id: updatedSubmission.id },
              data: { synced_to_tcn: true },
            });
          }
        }
      } catch (err: any) {
        await prisma.signup_submission.update({
          where: { id: updatedSubmission.id },
          data: {
            sync_attempts: 1,
            last_sync_error: err.message,
          },
        });
      }
    }

    return {
      success: true,
      data: {
        submissionId: updatedSubmission.id,
        cycle: nextCycle,
        webhookSynced: webhookSuccess,
      },
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

// Get submission history for a specific form
export async function getSubmissionHistory(
  tcnFormId: string,
  memberId: string
): Promise<ActionResult<any[]>> {
  try {
    const form = await prisma.signup_form.findUnique({
      where: { tcn_form_id: tcnFormId },
    });

    if (!form) {
      return { success: false, error: 'Form not found' };
    }

    const submission = await prisma.signup_submission.findUnique({
      where: {
        formId_fnmemberId: {
          formId: form.id,
          fnmemberId: memberId,
        }
      },
      include: {
        history: {
          orderBy: { created: 'desc' },
        },
      },
    });

    if (!submission) {
      return { success: true, data: [] };
    }

    // Include current submission as most recent entry
    const history = [
      {
        id: 'current',
        created: submission.updated,
        responses: submission.responses,
        submission_cycle: (submission.history[0]?.submission_cycle || 0) + 1,
        status: submission.status,
        isCurrent: true,
      },
      ...submission.history.map(h => ({
        ...h,
        isCurrent: false,
      })),
    ];

    return {
      success: true,
      data: history,
    };
  } catch (error: any) {
    return { success: false, error: handlePrismaError(error) };
  }
}

// ==================== MEMBER VERIFICATION ACTIONS ====================

// In-memory storage for verification attempts (in production, use Redis or database)
const verificationAttempts = new Map<string, { count: number; lockedUntil: Date | null }>();

const MAX_VERIFICATION_ATTEMPTS = 4;
const LOCKOUT_DURATION_HOURS = 24;

function getAttemptKey(tNumber: string): string {
  // Normalize treaty number for consistent tracking
  return tNumber.toUpperCase().replace(/^T/i, '');
}

function checkVerificationLockout(tNumber: string): { isLocked: boolean; message?: string } {
  const key = getAttemptKey(tNumber);
  const attempt = verificationAttempts.get(key);
  
  if (!attempt) return { isLocked: false };
  
  if (attempt.lockedUntil && new Date() < attempt.lockedUntil) {
    const hoursRemaining = Math.ceil((attempt.lockedUntil.getTime() - Date.now()) / (1000 * 60 * 60));
    return { 
      isLocked: true, 
      message: `This treaty number has been locked due to too many failed verification attempts. Please contact the system administrator or try again in ${hoursRemaining} hour(s).` 
    };
  }
  
  // Reset if lockout has expired
  if (attempt.lockedUntil && new Date() >= attempt.lockedUntil) {
    verificationAttempts.delete(key);
  }
  
  return { isLocked: false };
}

function recordVerificationAttempt(tNumber: string, success: boolean): { attemptsRemaining: number; isLocked: boolean } {
  const key = getAttemptKey(tNumber);
  
  if (success) {
    // Clear attempts on successful verification
    verificationAttempts.delete(key);
    return { attemptsRemaining: MAX_VERIFICATION_ATTEMPTS, isLocked: false };
  }
  
  const attempt = verificationAttempts.get(key) || { count: 0, lockedUntil: null };
  attempt.count += 1;
  
  if (attempt.count >= MAX_VERIFICATION_ATTEMPTS) {
    // Lock the treaty number
    attempt.lockedUntil = new Date(Date.now() + LOCKOUT_DURATION_HOURS * 60 * 60 * 1000);
    verificationAttempts.set(key, attempt);
    return { attemptsRemaining: 0, isLocked: true };
  }
  
  verificationAttempts.set(key, attempt);
  return { attemptsRemaining: MAX_VERIFICATION_ATTEMPTS - attempt.count, isLocked: false };
}

export type VerifyMemberResult = {
  success: boolean;
  verified?: boolean;
  member?: {
    firstName: string;
    lastName: string;
    tNumber: string;
  };
  error?: string;
  attemptsRemaining?: number;
  isLocked?: boolean;
};

export async function verifyMemberIdentity(
  tNumber: string,
  birthdate: string
): Promise<VerifyMemberResult> {
  try {
    // Normalize treaty number (remove leading T if present)
    const normalizedTNumber = tNumber.toUpperCase().replace(/^T/i, '');
    const tNumberWithPrefix = `T${normalizedTNumber}`;
    
    // Check if this treaty number is locked
    const lockoutStatus = checkVerificationLockout(tNumber);
    if (lockoutStatus.isLocked) {
      return {
        success: false,
        error: lockoutStatus.message,
        isLocked: true,
        attemptsRemaining: 0
      };
    }

    // Find member by treaty number (try both formats)
    const member = await prisma.fnmember.findFirst({
      where: {
        OR: [
          { t_number: normalizedTNumber },
          { t_number: tNumberWithPrefix },
          { t_number: tNumber }
        ]
      },
      select: {
        id: true,
        t_number: true,
        birthdate: true,
        first_name: true,
        last_name: true,
        activated: true,
        auth: true
      }
    });

    if (!member) {
      // Record failed attempt
      const attemptResult = recordVerificationAttempt(tNumber, false);
      
      if (attemptResult.isLocked) {
        return {
          success: false,
          error: "Too many failed attempts. This treaty number has been locked. Please contact the system administrator.",
          isLocked: true,
          attemptsRemaining: 0
        };
      }
      
      return {
        success: false,
        error: "Treaty number not found in our records.",
        attemptsRemaining: attemptResult.attemptsRemaining
      };
    }

    // Parse and compare birthdates
    const memberBirthdate = new Date(member.birthdate);
    const providedBirthdate = new Date(birthdate);
    
    // Compare dates (year, month, day only)
    const birthdateMatches = 
      memberBirthdate.getFullYear() === providedBirthdate.getFullYear() &&
      memberBirthdate.getMonth() === providedBirthdate.getMonth() &&
      memberBirthdate.getDate() === providedBirthdate.getDate();

    if (!birthdateMatches) {
      // Record failed attempt
      const attemptResult = recordVerificationAttempt(tNumber, false);
      
      if (attemptResult.isLocked) {
        return {
          success: false,
          error: "Too many failed attempts. This treaty number has been locked. Please contact the system administrator.",
          isLocked: true,
          attemptsRemaining: 0
        };
      }
      
      return {
        success: false,
        error: "Birthdate does not match our records. Please verify and try again.",
        attemptsRemaining: attemptResult.attemptsRemaining
      };
    }

    // Check if already activated
    if (member.auth) {
      return {
        success: false,
        error: "Your treaty number and birthdate are correct, but this account has already been activated. Please use the login page to sign in."
      };
    }

    if (member.activated === "ACTIVATED" || member.activated === "PENDING") {
      return {
        success: false,
        error: "Your treaty number and birthdate are correct, but this account is already registered. Please use the login page to sign in."
      };
    }

    // Success - clear attempts and return verified status
    recordVerificationAttempt(tNumber, true);

    return {
      success: true,
      verified: true,
      member: {
        firstName: member.first_name,
        lastName: member.last_name,
        tNumber: member.t_number
      }
    };

  } catch (error: any) {
    console.error("Verification error:", error);
    return {
      success: false,
      error: "An error occurred during verification. Please try again."
    };
  }
}