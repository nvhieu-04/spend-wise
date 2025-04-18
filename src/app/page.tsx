"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
          Welcome to Spend Wise
        </h1>
        {
          session ? (
            <p className="text-2xl text-white">
              You are signed in as {session.user?.name}
              <br />
              <button
                className="rounded-md bg-white px-4 py-2 text-black hover:bg-gray-200"
                onClick={() => signOut()}
              >
                Sign out
              </button>
            </p>
          ) : (
            <p className="text-2xl text-white">
              You are not signed in.{" "}
              <button
                className="rounded-md bg-white px-4 py-2 text-black hover:bg-gray-200"
                onClick={() => signIn()}
              >
                Sign in
              </button>
              <br />
              <span className="text-sm text-gray-400">
                Note: You will be redirected to GitHub to sign in.
              </span>
              <br />
            </p>
          )
        }
       
      </div>
    </main>
  );
}
