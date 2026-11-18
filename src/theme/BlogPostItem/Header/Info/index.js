import React from 'react';
import clsx from 'clsx';
import {translate} from '@docusaurus/Translate';
import {usePluralForm} from '@docusaurus/theme-common';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import useBlogDateFormat from '@site/src/utils/useBlogDateFormat';
import styles from '@docusaurus/theme-classic/lib/theme/BlogPostItem/Header/Info/styles.module.css';

function ReadingTime({readingTime}) {
  const {selectMessage} = usePluralForm();
  const minutes = Math.ceil(readingTime);
  const message = translate(
    {id: 'theme.blog.post.readingTime.plurals', message: 'One min read|{readingTime} min read'},
    {readingTime: minutes},
  );
  return selectMessage(minutes, message);
}

export default function BlogPostItemHeaderInfo({className}) {
  const {metadata: {date, readingTime}} = useBlogPost();
  const format = useBlogDateFormat({year: 'numeric', month: 'long', day: 'numeric'});

  return (
    <div className={clsx(styles.container, 'margin-vert--md', className)}>
      <time dateTime={date}>{format.format(new Date(date))}</time>
      {typeof readingTime === 'number' && <>, <ReadingTime readingTime={readingTime} /></>}
    </div>
  );
}
