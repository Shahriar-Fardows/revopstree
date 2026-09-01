import PostEditor from "../_components/PostEditor";

export default function NewPostPage() {
  return (
    <div className="a-page">
      <header className="a-page-head">
        <div>
          <span className="a-eyebrow">Content / Posts</span>
          <h1 className="a-title">New post</h1>
        </div>
      </header>

      <PostEditor />
    </div>
  );
}
