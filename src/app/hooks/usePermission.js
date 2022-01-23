/* eslint-disable import/prefer-default-export */

import { useEffect, useState } from 'react';

export function usePermission(name, initial) {
  const [state, setState] = useState(initial);

  let descriptor;

  const update = () => setState(descriptor.state);

  useEffect(() => {
    navigator.permissions.query({ name }).then((_descriptor) => {
      descriptor = _descriptor;

      update();
      descriptor.addEventListener('change', update);
    });

    return () => descriptor.removeEventListener('change', update);
  }, []);

  return state;
}
