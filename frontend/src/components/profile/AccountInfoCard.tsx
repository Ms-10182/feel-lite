
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface AccountInfoCardProps {
  username: string;
  email?: string;
  role?: string;
  onEditProfile: () => void;
}

const AccountInfoCard = ({ username, email, role, onEditProfile }: AccountInfoCardProps) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4">Account Information</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground">Username</label>
            <p>{username}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <p>{email || "No email provided"}</p>
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Role</label>
            <p className="capitalize">{role || "User"}</p>
          </div>
        </div>
        
        <div className="mt-6">
          <Button variant="outline" onClick={onEditProfile}>
            Edit Profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountInfoCard;
