import { useState, useCallback } from 'react';

export function useModal(defaultProps = {}) {
  const [state, setState] = useState({ isOpen: false, props: defaultProps });

  const open = useCallback((props = {}) => {
    setState({ isOpen: true, props: { ...defaultProps, ...props } });
  }, [defaultProps]);

  const close = useCallback(() => {
    setState((s) => ({ ...s, isOpen: false }));
  }, []);

  return { isOpen: state.isOpen, props: state.props, open, close };
}
