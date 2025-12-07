import React from 'react';
import BlogPostItem from '@theme-original/BlogPostItem';
import Giscus from '@giscus/react';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';

export default function BlogPostItemWrapper(props) {
  const { metadata, isBlogPostPage } = useBlogPost();
  const siteUrl = 'https://hyoyoonnam.github.io'; 

  // hits.sh 서비스 사용
  const targetPath = (siteUrl + metadata.permalink).replace('https://', '');
  const hitsImageUrl = `https://hits.sh/${targetPath}.svg?view=today-total&style=flat-square&label=hits&color=79C83D`;

  return (
    <>
      {/* ------------------------------------------------------- */}
      {/* [1] 조회수 뱃지 (상세 페이지에서만 표시!)                  */}
      {/* ------------------------------------------------------- */}
      {isBlogPostPage && (
        <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '10px'}}>
          <a href={`https://hits.sh/${targetPath}/`} title="조회수 상세 보기" style={{textDecoration: 'none'}}>
            <img
              src={hitsImageUrl}
              alt="hits"
              style={{ display: 'inline-block', height: '20px', verticalAlign: 'middle' }} 
            />
          </a>
        </div>
      )}

      {/* ------------------------------------------------------- */}
      {/* [2] 본문                                                */}
      {/* ------------------------------------------------------- */}
      <BlogPostItem {...props} />
      
      {/* ------------------------------------------------------- */}
      {/* [3] 댓글창 (상세 페이지에서만 표시)                       */}
      {/* ------------------------------------------------------- */}
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