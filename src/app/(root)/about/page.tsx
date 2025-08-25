"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function About() {
  // Use state to store image URLs
  const [images, setImages] = useState({
    about: "/assets/about.jpg",
    headteacher: "/assets/headteacher.jpg",
    deputy: "/assets/deputy.jpg",
    history: "/assets/history.jpg",
  })

  // In a real implementation, you would use actual image imports
  useEffect(() => {
    // In production, replace with actual image paths
    setImages({
      about: "/assets/about.jpg",
      headteacher: "/assets/headteacher.jpg",
      deputy: "/assets/deputy.jpg",
      history: "/assets/history.jpg",
    })
  }, [])

  return (
    <div className="min-h-screen">
      <div
        style={{ backgroundImage: `url(${images.about})` }}
        className="bg-cover bg-center bg-fixed h-[90vh] relative"
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <span className="absolute bottom-10 left-20 text-white text-3xl font-semibold z-10">About Us</span>
      </div>

      <div className="max-w-4xl mx-auto space-y-10 my-20 px-4">
        <Card className="border-none shadow-none">
          <CardContent className="space-y-8 pt-6">
            <div className="space-y-4 text-center">
              <h2 className="font-bold text-2xl text-primary">OUR MISSION</h2>
              <Separator className="mx-auto w-24 bg-primary" />
              <p className="text-muted-foreground leading-relaxed">
                KBHS High School aims to provide a supportive and challenging environment that fosters academic
                excellence, personal integrity, and global citizenship. We are dedicated to nurturing lifelong learners
                and critical thinkers who are prepared for a dynamic future.
              </p>
            </div>

            <div className="space-y-4 text-center">
              <h2 className="font-bold text-2xl text-primary">OUR VISION</h2>
              <Separator className="mx-auto w-24 bg-primary" />
              <p className="text-muted-foreground leading-relaxed">
                Our vision is to be a top educational institution in Kenya, known for academic excellence and holistic
                development. We strive to inspire students to be passionate learners and responsible leaders who
                positively impact their communities.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="h-[30vh] relative">
          <div className="h-full w-full relative">
            <Image
              src={images.history || "/placeholder.svg"}
              alt="our history banner"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-black/40"></div>
          </div>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-semibold z-10">
            OUR HISTORY
          </span>
        </div>

        <div className="my-20 max-w-4xl mx-auto px-6 space-y-8">
          <p className="text-muted-foreground leading-relaxed">
            KBHS High School, founded in 1978, has a rich history of academic excellence and community involvement in
            Kenya. Originally established to provide quality education to the local community, the school has grown over
            the years to become a leading institution recognized for its commitment to holistic development and
            innovation. The school began with a modest number of students and staff but quickly expanded its facilities
            and programs to meet the growing needs of its student body.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Over the decades, KBHS has introduced advanced academic curricula, state-of-the-art science facilities, and
            a wide range of extracurricular activities, ensuring a well-rounded education for its students. KBHS High
            School has consistently produced graduates who excel in various fields, contributing significantly to both
            local and global communities. The school remains dedicated to fostering a nurturing and challenging
            environment, preparing students for the dynamic challenges of the future while upholding the values of
            integrity, respect, and excellence.
          </p>
        </div>
      </div>

      <div>
        <div className="h-[30vh] relative">
          <Image
            src="/assets/time-managers.jpg"
            alt="our management banner"
            fill
            className="object-cover object-bottom"
          />
          <div className="absolute inset-0 bg-black/40"></div>
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-3xl font-semibold z-10">
            OUR MANAGEMENT
          </span>
        </div>

        <div className="my-20 max-w-5xl mx-auto px-6 flex flex-col md:flex-row justify-center gap-8">
          <Card className="relative overflow-hidden border-none shadow-lg h-[500px] w-full md:w-[400px]">
            <div className="h-full w-full relative">
              <Image src={images.headteacher || "/placeholder.svg"} alt="head teacher" fill className="object-cover" />
            </div>
            <div className="absolute bottom-0 bg-[#FFFDD0] w-full py-4 text-center flex flex-col gap-1 font-bold">
              <span>MR. G.M. BARASA</span>
              <span className="text-xs font-normal">SCHOOL PRINCIPAL</span>
            </div>
          </Card>

          <Card className="relative overflow-hidden border-none shadow-lg h-[500px] w-full md:w-[400px]">
            <div className="h-full w-full relative">
              <Image src={images.deputy || "/placeholder.svg"} alt="deputy teacher" fill className="object-cover" />
            </div>
            <div className="absolute bottom-0 bg-[#FFFDD0] w-full py-4 text-center flex flex-col gap-1 font-bold">
              <span>MR JUSTUS MUKWANGACHI</span>
              <span className="text-xs font-normal">SCHOOL DEPUTY PRINCIPAL</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
