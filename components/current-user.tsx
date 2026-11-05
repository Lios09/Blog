import { ClaudeThinking } from "@/assets/icon/claude-thinking";
import { getCurrentUser } from "@/lib/auth";

const CurrentUser = async () => {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <ClaudeThinking className="h-6 w-6" />
      {user.name}
    </div>
  );
};

export default CurrentUser;
