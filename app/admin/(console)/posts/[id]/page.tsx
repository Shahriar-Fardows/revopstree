import { notFound } from "next/navigation";
import { getPostForAdmin } from "@/lib/dal";
import StatusBadge from "../../../_components/StatusBadge";
import PostEditor from "../_components/PostEditor";

export default async function EditPostPage(props: PageProps<"/admin/posts/[id]">) {
  const { id } = await props.params;
  const post = await getPostForAdmin(id);

  if (!post) notFound();

  return (
    <div className="a-page">
      <header className="a-page-head">
        <div>
          <span className="a-eyebrow">Content / Posts</span>
          <h1 className="a-title">{post.title}</h1>
          <div style={{ marginTop: 10 }}>
            <StatusBadge status={post.status} />
          </div>
        </div>
      </header>

      <PostEditor post={post} />
    </div>
  );
}
