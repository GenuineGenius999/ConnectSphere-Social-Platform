import { PostsManagement } from "@/components/admin/posts-management";

export default function AdminPostsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Posts Management</h1>
        <p className="text-muted-foreground mt-1">View and moderate all platform posts</p>
      </div>
      <PostsManagement />
    </div>
  );
}
