import React from 'react';
import BlogAuthor from '@theme-original/Blog/Components/Author';

export default function BlogAuthorWrapper({author, ...props}) {
  return (
    <>
      <BlogAuthor author={author} {...props} />
      {author.description && (
        <p className="text--small margin-top--none margin-bottom--sm">
          {author.description}
        </p>
      )}
    </>
  );
}
