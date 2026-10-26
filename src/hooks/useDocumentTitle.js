import { useEffect } from 'react';

const BASE_TITLE = 'Urban Store';

export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | ${BASE_TITLE}` : `${BASE_TITLE} | Ropa urbana`;
  }, [title]);
}
