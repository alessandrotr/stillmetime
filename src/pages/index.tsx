import { withAuthenticator } from "@aws-amplify/ui-react";
import { API, Amplify } from "aws-amplify";
import awsExports from "@/aws-exports";
import "@aws-amplify/ui-react/styles.css";
import { useState, useEffect } from "react";
import { listPosts } from "../graphql/queries";
import { Post } from "@/models";

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
        const response = await API.graphql({
          query: listPosts,
        });

        const { data } = response as {
          data: {
            listPosts: {
              items: Post[];
            };
          };
        };

        if (data) {
          setPosts(data.listPosts.items);
        } else {
          setPosts([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setPosts([]);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div>
      <main>
        <h1>Hello {user.attributes.email}</h1>
        <button onClick={signOut}>Sign Out</button>
        {posts ? (
          <ul>
            {posts.map((post) => (
              <li key={post.id}>
                {post.title} - {post.content}
              </li>
            ))}
          </ul>
        ) : (
          "Loading..."
        )}
      </main>
    </div>
  );
}

export default withAuthenticator(Home);
