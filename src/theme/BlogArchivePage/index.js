import React from 'react';
import Link from '@docusaurus/Link';
import {translate} from '@docusaurus/Translate';
import {PageMetadata} from '@docusaurus/theme-common';
import Heading from '@theme/Heading';
import Layout from '@theme/Layout';
import useBlogDateFormat from '@site/src/utils/useBlogDateFormat';

export default function BlogArchivePage({archive}) {
  const title = translate({id: 'theme.blog.archive.title', message: 'Archive'});
  const description = translate({id: 'theme.blog.archive.description', message: 'Archive'});
  const yearFormat = useBlogDateFormat({year: 'numeric'});
  const dayFormat = useBlogDateFormat({month: 'long', day: 'numeric'});
  const years = new Map();
  for (const {metadata} of archive.blogPosts) {
    const date = new Date(metadata.date);
    const year = yearFormat.formatToParts(date).find(part => part.type === 'year').value;
    if (!years.has(year)) {
      years.set(year, []);
    }
    years.get(year).unshift({...metadata, label: dayFormat.format(date)});
  }

  return (
    <Layout>
      <PageMetadata title={title} description={description} />
      <header className="hero hero--primary">
        <div className="container">
          <Heading as="h1" className="hero__title">{title}</Heading>
          <p className="hero__subtitle">{description}</p>
        </div>
      </header>
      <main>
        <section className="margin-vert--lg">
          <div className="container">
            <div className="row">
              {Array.from(years, ([year, posts]) => (
                <div key={year} className="col col--4 margin-vert--lg">
                  <Heading as="h3" id={year}>{year}</Heading>
                  <ul>
                    {posts.map(({permalink, title: postTitle, label}) => (
                      <li key={permalink}><Link to={permalink}>{label} - {postTitle}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
