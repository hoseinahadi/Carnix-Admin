// هوک سفارشی برای تشخیص اینکه یک المان در viewport قرار داره یا نه
// از IntersectionObserver API استفاده می‌کنه

import { useEffect, useRef, useState } from 'react'

type UseIntersectionOptions = {
  threshold?: number
  rootMargin?: string
}

type IntersectionMap = Record<string, boolean>

const useIntersection = (
  ids: string[],
  options: UseIntersectionOptions = {}
): IntersectionMap => {
  const { threshold = 0.1, rootMargin = '0px' } = options
  const [intersections, setIntersections] = useState<IntersectionMap>({})
  const observersRef = useRef<Map<string, IntersectionObserver>>(new Map())

  useEffect(() => {
    // پاک کردن observer های قبلی
    observersRef.current.forEach(observer => observer.disconnect())
    observersRef.current.clear()

    ids.forEach(id => {
      const element = document.getElementById(id)
      if (!element) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          setIntersections(prev => ({
            ...prev,
            [id]: entry.isIntersecting,
          }))
        },
        { threshold, rootMargin }
      )

      observer.observe(element)
      observersRef.current.set(id, observer)
    })

    return () => {
      observersRef.current.forEach(observer => observer.disconnect())
      observersRef.current.clear()
    }
  }, [ids, threshold, rootMargin])

  return intersections
}

export default useIntersection
