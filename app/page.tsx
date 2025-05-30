import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import LandingPage from "@/components/landing/landing-page"

export default function Home() {
  const cookieStore = cookies()
  const token = cookieStore.get("token")

  // If user is logged in, redirect to feed
  if (token) {
    redirect("/feed")
  }

  return <LandingPage />
}
