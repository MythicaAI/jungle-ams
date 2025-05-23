import type { JSX } from "react";



export interface TeamMember {
    name: string;
    role: string;
    bio: string;
    imageSrc: string;
    imageText: string;
    socialLinks: string[];
    delay?: number;
};

export const teamMembers: TeamMember[] = [
    {
        name: "Slater Victoroff",
        role: "CEO, FOUNDER",
        bio: "",
        imageSrc: "/images/headshots/slater.jpg",
        imageText: "Slater V",
        socialLinks: ["https://www.linkedin.com/in/slatervictoroff/"],
    },
    {
        name: "Tori Holmes-Kirk",
        role: "FOUNDING TECHNICAL ARTIST",
        bio: "",
        imageSrc: "/images/headshots/tori.jpg",
        imageText: "Tori H",
        socialLinks: ["https://www.linkedin.com/in/supertorio/"],

    },
    {
        name: "Max Spurlock",
        role: "FOUNDING TECHNICAL ARTIST",
        bio: "",
        imageSrc: "/images/headshots/max.jpg",
        imageText: "Max S",
        socialLinks: ["https://www.linkedin.com/in/maxspurlock/"]
    },
    {
        name: "Pedro Martello",
        role: "FOUNDING ENGINEER",
        bio: "",
        imageSrc: "/images/headshots/pedro.jpg",
        imageText: "Pedro M",
        socialLinks: ["https://www.linkedin.com/in/pedromartello/"]
    },
    {
        name: "Becky Arakelian",
        role: "DIRECTOR OF OPERATIONS",
        bio: "",
        imageSrc: "/images/headshots/becky.jpg",
        imageText: "Becky A",
        socialLinks: ["https://www.linkedin.com/in/rebecca-goodless-arakelian-1a516160/"]
    },
    {
        name: "Sam Kaminer",
        role: "DIRECTOR OF COMMUNITY & MEDIA",
        bio: "",
        imageSrc: "/images/headshots/sam.jpg",
        imageText: "Sam K",
        socialLinks: ["https://www.linkedin.com/in/samuel-kaminer-27968a116/"],
    },
    {
        name: "Jacob Repp",
        role: "HEAD OF ENGINEERING",
        bio: "",
        imageSrc: "/images/headshots/jacob.jpg",
        imageText: "Jacob R",
        socialLinks: ["https://www.linkedin.com/in/jacobrepp/"],
    },
    {
        name: "Kevin Calderone",
        role: "PRINCIPAL ENGINEER",
        bio: "",
        imageSrc: "/images/headshots/kevin.jpg",
        imageText: "Kevin C",
        socialLinks: [ "https://www.linkedin.com/in/kevincalderone/"],
    },
    {
        name: "Igor Titov",
        role: "LEAD LIGHTING ARTIST",
        bio: "",
        imageSrc: "/images/headshots/igor.jpg",
        imageText: "Igor T",
        socialLinks: ["https://www.linkedin.com/in/gheromo/"],
    }
];