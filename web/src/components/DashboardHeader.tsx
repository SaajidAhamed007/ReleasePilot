import { auth, signIn, signOut } from "@/auth";

export async function DashboardHeader() {
  const session = await auth();

  return (
    <div className="fixed top-4 right-4 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-[#0c0c14]/80 px-3 py-1.5 text-xs text-white/70 backdrop-blur-xl">
      {session?.user ? (
        <>
          <span className="max-w-[160px] truncate">{session.user.name ?? session.user.email}</span>
          <a href="/connect" className="text-white/40 hover:text-white">
            Manage repos
          </a>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <button type="submit" className="text-white/40 hover:text-white">
              Sign out
            </button>
          </form>
        </>
      ) : (
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/" });
          }}
        >
          <button type="submit" className="font-medium text-white hover:text-violet-300">
            Sign in with GitHub
          </button>
        </form>
      )}
    </div>
  );
}
