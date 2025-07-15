'use client'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Swiper as SwiperType } from 'swiper'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'
import { useRef, useState, useEffect } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

export default function Home() {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [currentTranslate, setCurrentTranslate] = useState(0)
  const swiperRef = useRef<SwiperType | null>(null)
  const [centerOffset, setCenterOffset] = useState(0)
  const slides = [
    { id: 1, content: 'slide 1', bg: '!bg-red-500' },
    { id: 2, content: 'slide 2', bg: '!bg-blue-500' },
    { id: 3, content: 'slide 3', bg: '!bg-green-500' },
    { id: 4, content: 'slide 4', bg: '!bg-yellow-500' },
    { id: 5, content: 'slide 5', bg: '!bg-purple-500' },
    { id: 6, content: 'slide 6', bg: '!bg-pink-500' },
    { id: 7, content: 'slide 7', bg: '!bg-indigo-500' },
    { id: 8, content: 'slide 8', bg: '!bg-teal-500' },
    { id: 9, content: 'slide 9', bg: '!bg-orange-500' },
    { id: 10, content: 'slide 10', bg: '!bg-lime-500' },
    { id: 11, content: 'slide 11', bg: '!bg-cyan-500' },
    { id: 12, content: 'slide 12', bg: '!bg-emerald-500' },
    { id: 13, content: 'slide 13', bg: '!bg-fuchsia-500' },
    { id: 14, content: 'slide 14', bg: '!bg-rose-500' },
    { id: 15, content: 'slide 15', bg: '!bg-sky-500' }
  ]

  const slideRefs = useRef<Array<HTMLDivElement | null>>(slides.map(() => null))

  const handleSlideChange = (swiper: SwiperType) => {
    console.log('slide changed', swiper.realIndex)
    const centerSlideRect = slideRefs.current[swiper.realIndex]?.getBoundingClientRect()
    const centerOffset = centerSlideRect ? centerSlideRect.left + centerSlideRect.width / 2 : 0
    setCenterOffset(centerOffset)
    console.log('centerOffset', centerOffset)
    setActiveIndex(swiper?.realIndex)
  }

  useEffect(() => {
    if (!slideRefs.current?.[0]) return
    const centerSlideRect = slideRefs.current[activeIndex]?.getBoundingClientRect()
    const centerOffset = centerSlideRect ? centerSlideRect.left + centerSlideRect.width / 2 : 0
    setCenterOffset(centerOffset)
    console.log('centerOffset', centerOffset)
  }, [activeIndex])

  const RADIUS = 6000 //px
  const SLIDE_GAP = 40 //px

  useGSAP(() => {
    slideRefs.current.forEach((slideRef, index) => {
      if (!slideRef) return
      const slideRect = slideRef.getBoundingClientRect()
      const slideWidth = slideRect.width

      let offsetIndex = index - activeIndex
      const totalSlides = slides.length
      if (offsetIndex > totalSlides / 2) offsetIndex -= totalSlides
      if (offsetIndex < -totalSlides / 2) offsetIndex += totalSlides
      const slideCenter = slideRect?.left + slideWidth / 2 - centerOffset

      const xOffSet = slideCenter

      const theta = Math.acos(xOffSet / RADIUS)
      const yOffset = (1 - Math.sin(theta)) * RADIUS
      gsap.set(slideRef, {
        y: yOffset,
        rotation: `${Math.PI / 2 - theta}rad`,
        transformOrigin: 'center bottom',
        duration: 0.5,
        ease: 'power2.out'
      })

      setTimeout(() => {
        const thetaElement = slideRef.querySelector('.theta')
        if (thetaElement) {
          thetaElement.textContent = `theta: ${theta.toFixed(2)}`
        }
        const rotationElement = slideRef.querySelector('.rotation')
        if (rotationElement) {
          rotationElement.textContent = `rotation: ${Math.PI / 2 - theta}`
        }
        const leftElement = slideRef.querySelector('.left')
        if (leftElement) {
          leftElement.textContent = `left: ${slideRect.left}`
        }
        const widthElement = slideRef.querySelector('.width')
        if (widthElement) {
          widthElement.textContent = `width: ${slideWidth.toFixed(2)}`
        }
        const directionElement = slideRef.querySelector('.direction')
        if (directionElement) {
          directionElement.textContent = `direction: ${offsetIndex > 0 ? 'right' : 'left'}`
        }
        const slideCenterElement = slideRef.querySelector('.lineLeft')
        if (slideCenterElement) {
          slideCenterElement.textContent = `lineLeft: ${
            slideRect.left + slideWidth / 2 - centerOffset
          }`
        }
      }, 100)
    })
  }, [centerOffset, currentTranslate, activeIndex])

  return (
    <div className='h-screen w-screen flex overflow-hidden relative '>
      <div className='absolute bg-red-500 h-full w-[1px] left-1/2 -translate-x-1/2 z-30' />
      <Swiper
        className='!max-w-screen my-auto py-20 border border-red-500 my-stepped-carousal transition-all'
        modules={[Autoplay]}
        spaceBetween={SLIDE_GAP}
        slidesPerView='auto'
        // centeredSlides
        loop={true}
        speed={500}
        onSetTranslate={() => {
          setCurrentTranslate(swiperRef.current?.translate ?? 0)
        }}
        onSwiper={(swiper) => {
          console.log('swiper initialized', swiper)
          swiperRef.current = swiper
          setActiveIndex(swiper.realIndex)
        }}
        onSlideChange={handleSlideChange}
        autoplay={{
          delay: 2000
        }}
      >
        {slides.map((slide, slideIndex) => {
          // Create a ref for each slide
          return (
            <SwiperSlide
              className={`!h-fit !w-fit  card-slide card-slide-${slide.id}`}
              key={slide.id}
              virtualIndex={slideIndex}
            >
              {() => {
                return (
                  <div
                    className={`${slide.bg} !h-[300px] relative !w-[250px]`}
                    key={slide.id}
                    ref={(el) => {
                      slideRefs.current[slideIndex] = el
                    }}
                  >
                    <div>slide: {slideIndex}</div>
                    <div className='slideCenter'>slideCenter: </div>
                    <div className='slideCenterOffset'>slideCenter: {activeIndex}</div>
                    <div className='theta'>theta: </div>
                    <div className='rotation'>rotation: </div>
                    <div className='left'>left: </div>
                    <div className='width'>width: </div>
                    <div className='direction'>direction: </div>
                    <div className='lineLeft'>lineLeft: </div>
                  </div>
                )
              }}
            </SwiperSlide>
          )
        })}
      </Swiper>

      <div className='absolute top-0 left-0 right-0 flex justify-between p-4'>
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className='bg-white rounded-full p-2 shadow'
        >
          Prev
        </button>
        <div className=''>
          <p>centerOffset: {centerOffset}</p>
        </div>
        <button
          onClick={() => swiperRef.current?.slideNext()}
          className='bg-white rounded-full p-2 shadow'
        >
          Next
        </button>
      </div>
    </div>
  )
}
