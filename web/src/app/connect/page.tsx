import { auth, signIn } from "@/auth";
import { ConnectRepoFlow } from "@/components/ConnectRepoFlow";

export default async function ConnectPage() {
  const session = await auth();

  if (!session) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-[#0a0a0f] px-6 text-center">
        <h1 className="text-2xl font-semibold text-white">Sign in to connect a repository</h1>
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/connect" });
          }}
        >
          <button
            type="submit"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-white/90"
          >
            Sign in with GitHub
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#0a0a0f]">
      <ConnectRepoFlow />
    </div>
  );
}
