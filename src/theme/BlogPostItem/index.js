import React from 'react';
import BlogPostItem from '@theme-original/BlogPostItem';
import Giscus from '@giscus/react';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';

export default function BlogPostItemWrapper(props) {
  const { metadata, isBlogPostPage } = useBlogPost();

  return (
    <>
      <BlogPostItem {...props} />
      
      {/* 상세 페이지(isBlogPostPage)일 때만 댓글창 표시 */}
      {isBlogPostPage && (
        <div style={{marginTop: '50px'}}>
          <Giscus
            id="comments"
            repo="HyoYoonNam/hyoyoonnam.github.io" 
            repoId="R_kgDOPbiiBA"
            category="General"
            categoryId="DIC_kwDOPbiiBM4Cvdvb"
            mapping="pathname"
            strict="0"
            reactionsEnabled="1"
            emitMetadata="0"
            inputPosition="bottom"
            theme="preferred_color_scheme"
            lang="ko"
            loading="lazy"
          />
        </div>
      )}
    </>
  );
}