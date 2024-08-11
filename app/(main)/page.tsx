import Main from "@/components/main";
import { validateRequest } from "@/lib/auth";

export default async function Page() {
  let user = (await validateRequest()).user;
  
  return <Main user={user as any}  />;
}
