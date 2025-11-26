"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useState, useEffect } from "react"
import { Backbtn } from "@/components/Backbtn"
import { Hamburger } from "@/components/Hamburger"
import { motion } from "framer-motion"
// Image data separated by category
const GALLERY_IMAGES = {
   
    history: [
        { src: '/gallery/tcnhistoric1.jpg', alt: 'History 1' },
        { src: '/gallery/tcnhistoric2.jpg', alt: 'History 2' },
        { src: '/gallery/tcnhistoric3.jpg', alt: 'History 3' },
        { src: '/gallery/tcnhistoric4.jpg', alt: 'History 4' },
        { src: '/gallery/tcnhistoric5.jpg', alt: 'History 5' },
        { src: '/gallery/tcnhistoric6.jpg', alt: 'History 6' },
        { src: '/gallery/tcnhistoric7.jpg', alt: 'History 7' },
        { src: '/gallery/tcnhistoric8.jpg', alt: 'History 8' },
        { src: '/gallery/tcnhistoric9.jpg', alt: 'History 9' },
        { src: '/gallery/tcnhistoric10.jpg', alt: 'History 10' },
    ],
    cultural: [
        { src: '/gallery/culture11.jpg', alt: 'Culture 1' },
        { src: '/gallery/culture12.jpg', alt: 'Culture 2' },
        { src: '/gallery/LandPrograms11.jpg', alt: 'Land Programs 1' },
        { src: '/gallery/tcnpeople.jpg', alt: 'TCN People' },
        { src: '/gallery/LandUse11.jpg', alt: 'Land Use 1' },
        { src: '/gallery/LandUse12.jpg', alt: 'Land Use 2' },
        { src: '/gallery/LandUse1.jpg', alt: 'Land Use 3' },
        { src: '/gallery/LandUse2.jpg', alt: 'Land Use 4' },
        { src: '/gallery/LandUse4.jpg', alt: 'Land Use 5' },
        { src: '/gallery/LandUse5.jpg', alt: 'Land Use 6' },
    ]
} as const;

export default function page() {
    const [activeTab, setActiveTab] = useState<keyof typeof GALLERY_IMAGES>("history");
    const [isLoading, setIsLoading] = useState(true);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    
    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Preload images for the active tab
    useEffect(() => {
        setIsLoading(true);
        const preloadImages = GALLERY_IMAGES[activeTab].map(img => {
            return new Promise((resolve) => {
                const image = new Image();
                image.src = img.src;
                image.onload = resolve;
            });
        });

        Promise.all(preloadImages).then(() => {
            setIsLoading(false);
        });
    }, [activeTab]);
    
    type CarouselOptionsType = {
        align: "start" | "center";
        loop: boolean;
        skipSnaps: boolean;
        dragFree: boolean;
        containScroll: "trimSnaps" | "keepSnaps";
    };
    
    const carouselOptions: CarouselOptionsType = {
        align: windowWidth < 768 ? "start" : "center",
        loop: true,
        skipSnaps: false,
        dragFree: windowWidth < 768,
        containScroll: "trimSnaps"
    };

    const menuItems = [
        { 
      label: "About Tataskweyak", 
      to: "/pages/AboutTCN", 
      color: "stone" as const 
    },
    { 
      label: "About Who We Are", 
      to: "/pages/WorldViewHome", 
      color: "stone" as const 
    },
    { 
      label: "Photo Gallery", 
      to: "/pages/PhotoGallery", 
      color: "stone" as const 
    },
    { 
      label: "Home", 
      to: "/", 
      color: "stone" as const 
    },
    ]

    // Desktop Navigation - matching BandHall pattern
    const DesktopNav = () => (
        <div className="hidden lg:block">
            <div className="bg-amber-900 backdrop-blur-sm border-b border-amber-600/50">
                <div className="grid grid-cols-4 gap-4 h-full items-center px-4">
                    <Backbtn />
                    <div/>
                    <div/>
                    <div/>
                </div>
            </div>
        </div>
    )

    return (
        <div className="w-full min-h-screen genbkg">
            {/* Navigation */}
            <div className="sticky top-0 z-50 relative">
                <Hamburger menuItems={menuItems} showBackButton={true} />
                <DesktopNav />
            </div>

            {/* Hero Section - matching BandHall pattern */}
            <section className="relative">
                <div className="photobkg h-[30vh] sm:h-[30vh] lg:h-[40vh] flex items-center justify-center bg-cover bg-center border-b-4 border-green-700">
                    <div className="relative z-10 text-center px-4">
                        <img src="/tcnlogosm.png" className="mx-auto w-16 sm:w-20 lg:w-24 mb-4 drop-shadow-lg" />
                        <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-2 text-amber-50 drop-shadow-lg">
                            Tataskweyak Cree Nation
                        </h1>
                        <p className="text-md md:text-base lg:text-lg text-amber-100 drop-shadow-md">
                            Photo Gallery
                        </p>
                    </div>
                </div>
            </section>

            {/* Gallery Section - matching BandHall pattern */}
            <section className="w-full py-8 sm:py-12 lg:py-14 relative">
                <div className="container mx-auto px-4 w-full lg:w-8/10"> 
                    <Tabs 
                        defaultValue="history" 
                        className="w-full h-full"
                        onValueChange={(value: string) => setActiveTab(value as keyof typeof GALLERY_IMAGES)}
                    >
                        <TabsList className="grid grid-cols-2 mb-6 sm:mb-8 w-full h-full max-w-md sm:max-w-lg lg:max-w-7xl mx-auto bg-amber-100/95 backdrop-blur-sm rounded-lg p-1 sm:p-2 border border-amber-200/60 shadow-lg">
                            <TabsTrigger
                                value="history"
                                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-amber-800 rounded-md transition-all duration-200 py-2 sm:py-3 lg:py-4 font-medium"
                            >
                                <span className="text-sm sm:text-base lg:text-lg">History</span>
                            </TabsTrigger>
                            <TabsTrigger
                                value="cultural"
                                className="data-[state=active]:bg-green-600 data-[state=active]:text-white text-amber-800 rounded-md transition-all duration-200 py-2 sm:py-3 lg:py-4 font-medium"
                            >
                                <span className="text-sm sm:text-base lg:text-lg">Land</span>
                            </TabsTrigger>
                            
                        </TabsList>

                        <div className="min-h-[400px] sm:min-h-[500px]">
                            {Object.entries(GALLERY_IMAGES).map(([category, images]) => (
                                <TabsContent key={category} value={category} className="mt-0">
                                    {isLoading ? (
                                        <div className="w-full h-64 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                                        </div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            whileInView={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                            className="w-full"
                                        >
                                            <Carousel 
                                                className="w-full max-w-5xl mx-auto"
                                                opts={carouselOptions}
                                            >
                                                <CarouselContent>
                                                    {images.map((img, index) => (
                                                       <CarouselItem key={index} className="md:basis-1/1">
                                                            <div className="w-full aspect-[3/2] sm:aspect-[4/3] md:aspect-[16/9] p-1 sm:p-2">
                                                                <img 
                                                                    src={img.src} 
                                                                    alt={img.alt}
                                                                    loading="lazy"
                                                                    className="w-full h-full object-contain rounded-lg border-2 border-amber-200/50 shadow-lg bg-amber-50/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:border-amber-300"
                                                                    decoding="async"
                                                                />
                                                            </div>
                                                        </CarouselItem>
                                                    ))}
                                                </CarouselContent>
                                                <div className="hidden md:block">
                                                    <CarouselPrevious className="bg-amber-100/90 border-amber-300 hover:bg-amber-200/90 text-amber-800" />
                                                    <CarouselNext className="bg-amber-100/90 border-amber-300 hover:bg-amber-200/90 text-amber-800" />
                                                </div>
                                            </Carousel>
                                        </motion.div>
                                    )}
                                </TabsContent>
                            ))}
                        </div>
                    </Tabs>
                </div>
            </section>
        </div>
    )
}