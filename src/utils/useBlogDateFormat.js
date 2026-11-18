import {useDateTimeFormat} from '@docusaurus/theme-common/internal';

export default function useBlogDateFormat(options) {
  return useDateTimeFormat({...options, timeZone: 'Asia/Seoul'});
}
