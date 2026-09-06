import { db } from "./auth.js";

export async function requireUser() {
  const {
    data: { user },
    error,
  } = await db.auth.getUser();

  if (error || !user) {
    location.replace("./index.html");
    return null;
  }

  return user;
}

export async function requireProfile() {
  const user = await requireUser();

  if (!user) {
    return null;
  }

  const {
    data: profile,
    error,
  } = await db
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !profile) {
    console.error(
      "ไม่พบ user profile:",
      error
    );

    return {
      user,
      profile: null,
    };
  }

  return {
    user,
    profile,
  };
}

export async function logout() {
  await db.auth.signOut();

  location.replace(
    "./index.html"
  );
}
