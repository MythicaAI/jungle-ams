
export interface Testimonial {
  text: string;
  textFull: string;
  author: string;
  role: string;
  company: string;
  image: string;
  imageAlt: string;
}

export const testimonials = [
  {
    text: "Mythica is very, very good at what they do... I would have to hire a whole department to do what Mythica does.",
    author: "Josiah Kiehl",
    role: "CEO",
    company: "Sprocket Games",
    image: "/images/sprocket-games-logo.avif",
    imageAlt: "Sprocket Games Logo"
  },
  {
    text: "Mythica was able to increase our workflow dramatically by expanding the capabilities of the toolsets we're using.",
    textFull: "Mythica was able to increase our workflow dramatically by expanding the capabilities of the toolsets we're using. For a group like ours that is experimenting with new ways to make and visualize games, having help from a group like Mythica, who have the vision to embrace and improve upon what we're doing, was invaluable. They were also able to help us integrate tools nicely into our custom pipelines, further improving the time it takes us to both make and implement assets directly into the game.",
    author: "Jay Wilson",
    role: "Design Director and Founder",
    company: "Gas Giant Games",
    image: "/images/gas-giant-games-logo.png",
    imageAlt: ""
  }
]
