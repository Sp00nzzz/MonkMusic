import { GetServerSideProps } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
  try {
    // Read the HTML file from public folder
    const htmlPath = join(process.cwd(), 'public', 'index.html');
    const htmlContent = readFileSync(htmlPath, 'utf8');
    
    // Set headers and write the HTML content directly
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.write(htmlContent);
    res.end();
    
    // Return empty props since we're handling the response directly
    return { props: {} };
  } catch (error) {
    console.error('Error serving index.html:', error);
    // If there's an error, return 404
    res.statusCode = 404;
    res.end();
    return { props: {} };
  }
};

// This component won't render since we're handling the response in getServerSideProps
export default function CustomPage() {
  return null;
}


