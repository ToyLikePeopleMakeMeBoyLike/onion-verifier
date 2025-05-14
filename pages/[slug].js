import { promises as fs } from 'fs';
import path from 'path';

export async function getServerSideProps({ params }) {
  const { slug } = params;
  const file = path.join(process.cwd(), 'data', 'urls.json');
  let store = {};
  try {
    store = JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {}
  const destination = store[slug];

  if (!destination) {
    return { notFound: true };
  }

  return {
    redirect: {
      destination,
      permanent: false
    }
  };
}

export default function Redirect() {
  // This component is never actually rendered
  return null;
}
