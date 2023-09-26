import { withAuthenticator } from "@aws-amplify/ui-react";
import { Amplify, DataStore } from "aws-amplify";
import awsExports from "@/aws-exports";
import "@aws-amplify/ui-react/styles.css";
import { useState, useEffect } from "react";
import { LazyComment, Post } from "@/models";
// import PostCreateForm from "@/ui-components/PostCreateForm";
import "../app/globals.css";
import Image from "next/image";

type HomeProps = {
  signOut: () => void;
  user: {
    attributes: {
      email: string;
    };
  };
};

Amplify.configure({ ...awsExports, ssr: true });

function Home({ signOut, user }: HomeProps) {
  const [posts, setPosts] = useState<Post[] | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const posts = await DataStore.query(Post);
        setPosts(posts);
      } catch (error) {
        console.log("Error retrieving posts", error);
        setPosts([]);
      }
    };
    fetchPosts();
  }, []);

  const [postComments, setPostComments] = useState<
    Record<string, LazyComment[]>
  >({});

  useEffect(() => {
    const fetchComments = async () => {
      if (posts) {
        const comments = await Promise.all(
          posts.map(async (post) => {
            const postComments = post.Comments
              ? await post.Comments.toArray()
              : [];
            return { postId: post.id, comments: postComments };
          })
        );

        const commentsMap: Record<string, LazyComment[]> = {};
        comments.forEach(({ postId, comments }) => {
          commentsMap[postId] = comments;
        });

        setPostComments(commentsMap);
      }
    };
    fetchComments();
  }, [posts]);

  return (
    <div>
      <main className="p-4">
        <div className="flex justify-between pb-4">
          <h1>Hello {user.attributes.email}</h1>
          <button onClick={signOut}>Sign Out</button>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {posts
            ? posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white p-4 mb-4 text-black shadow-md rounded-xl"
                >
                  {post.imageStorageKey && (
                    <Image
                      src={post.imageStorageKey}
                      alt="yo"
                      width={500}
                      height={500}
                      // loading="lazy"
                      priority={true}
                    />
                  )}
                  <h1 className="text-3xl">{post.title}</h1>
                  <p className="my-8">{post.content}</p>
                  <div>
                    {postComments[post.id]?.map((comment) => (
                      <>
                        <h3 className="font-bold">Comments on {post.title}:</h3>
                        <p
                          className="bg-gray-100 p-2 my-2 rounded"
                          key={comment.id}
                        >
                          {comment.content}
                        </p>
                      </>
                    ))}
                  </div>
                </div>
              ))
            : "Loading..."}
        </div>
        {/* <PostCreateForm /> */}
      </main>
    </div>
  );
}

export default withAuthenticator(Home);
