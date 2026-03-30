"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { BsGithub } from "react-icons/bs"
import { Globe, ServerIcon } from "lucide-react"


type AnimatedFrameworksProps = {
  cardTitle?: string
  cardDescription?: string
}

const AnimatedFrameworks = ({
  cardTitle = "Her Dille Uyumlu",
  cardDescription = "Go, Rust, TypeScript, C++ veya Python fark etmez. Localhost'unuzda koşan her servisi tek komutla dünyaya açın.",
}: AnimatedFrameworksProps) => {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between",
        "h-[20rem] space-y-4 rounded-xl border shadow-sm",
        // Karanlık tema ve binboi arkaplanına tam uyum
        "border-white/10 bg-[#080808]" 
      )}
    >
      <FrameworkCard />
      <div className="px-6 pb-6 z-10">
        <div className="text-lg font-bold text-white">
          {cardTitle}
        </div>
        <div className="mt-2 text-sm text-gray-400">
          {cardDescription}
        </div>
      </div>
    </div>
  )
}

export { AnimatedFrameworks } // Hatalı export düzeltildi

const FrameworkCard = () => {
  const [nextJsTransform, setNextJsTransform] = useState("none")
  const [reactTransform, setReactTransform] = useState("none")
  const [htmlTransform, setHtmlTransform] = useState("none")

  useEffect(() => {
    const cycleAnimations = async () => {
      const upStyle = "translateY(-3.71px) rotateX(10.71deg) translateZ(20px)"
      const downStyle = "none"

      const transitionDuration = 1100
      const durationOfUpState = 1200
      const delayBetweenCards = 600

      while (true) {
        setReactTransform(upStyle)
        await new Promise((resolve) => setTimeout(resolve, durationOfUpState))
        setReactTransform(downStyle)
        await new Promise((resolve) =>
          setTimeout(resolve, transitionDuration + delayBetweenCards)
        )

        setNextJsTransform(upStyle)
        await new Promise((resolve) => setTimeout(resolve, durationOfUpState))
        setNextJsTransform(downStyle)
        await new Promise((resolve) =>
          setTimeout(resolve, transitionDuration + delayBetweenCards)
        )

        setHtmlTransform(upStyle)
        await new Promise((resolve) => setTimeout(resolve, durationOfUpState))
        setHtmlTransform(downStyle)
        await new Promise((resolve) =>
          setTimeout(resolve, transitionDuration + delayBetweenCards)
        )
      }
    }

    cycleAnimations()
  }, [])

  // Kartların iç tasarımını tam karanlık, gölgeli ve neon border yapısına uygun hale getirdim
  const cardClasses =
    "flex aspect-square items-center justify-center rounded-xl border p-4 " +
    "bg-gradient-to-b from-[#111] to-[#080808] border-white/10 " +
    "shadow-[0_8px_30px_rgb(0,217,255,0.05)] " + // Hafif neon gölge
    "[@media(min-width:320px)]:h-20 [@media(min-width:500px)]:h-28 " + // Kart boyutlarını biraz optimize ettim
    "transition-transform duration-1000 ease-out will-change-transform"

  return (
    <>
      <div
        className={cn(
          "relative",
          "flex flex-col items-center justify-center gap-1",
          "h-[14.5rem] w-full mt-4"
        )}
      >
        <div className="absolute flex h-full w-full items-center justify-center">
          <div className="h-full w-[15rem]">
            <svg
              className="h-full w-full"
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              fill="none"
            >
              {/* Arka plandaki sönük hat */}
              <g
                stroke="currentColor"
                strokeWidth="0.1"
                className="text-white/20"
              >
                <path d="M 1 0 v 5 q 0 5 5 5 h 39 q 5 0 5 5 v 71 q 0 5 5 5 h 39 q 5 0 5 5 v 5" />
              </g>
              
              {/* Animasyonlu akışın olduğu hat (Cyan) */}
              <g mask="url(#framework-mask)">
                <circle
                  className="frameworkline framework-line"
                  cx="0"
                  cy="0"
                  r="12"
                  fill="url(#framework-cyan-grad)"
                />
              </g>
              <defs>
                <mask id="framework-mask">
                  <path
                    d="M 1 0 v 5 q 0 5 5 5 h 39 q 5 0 5 5 v 71 q 0 5 5 5 h 39 q 5 0 5 5 v 5"
                    strokeWidth="0.3"
                    stroke="white"
                  />
                </mask>
                <radialGradient id="framework-cyan-grad" fx="1">
                  {/* Renk binboi neon mavisine (#00d9ff) çevrildi */}
                  <stop offset="0%" stopColor={"#00d9ff"} />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>
        
        <div
          className={cn(
            "flex items-center justify-center gap-6 z-10",
            "[perspective:1000px] [transform-style:preserve-3d]"
          )}
        >
          {/* İkonlarını terminal, server, veritabanı gibi şeylerle veya dil logolarıyla değiştirebilirsin */}
          <div className={cardClasses} style={{ transform: reactTransform }}>
            <BsGithub className="size-6 text-white [@media(min-width:500px)]:size-9" />
          </div>
          <div className={cardClasses} style={{ transform: nextJsTransform }}>
            <ServerIcon className="size-6 text-[#00d9ff] [@media(min-width:500px)]:size-9" />
          </div>
          <div className={cardClasses} style={{ transform: htmlTransform }}>
            <Globe className="size-6 text-white [@media(min-width:500px)]:size-9" />
          </div>
        </div>

        {/* Alt kısımdaki fade efekti, siyah temaya uygun hale getirildi */}
        <div className="absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-[#080808] to-transparent pointer-events-none" />
      </div>
    </>
  )
}