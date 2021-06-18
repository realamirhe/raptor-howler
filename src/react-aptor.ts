import {
  useEffect,
  useImperativeHandle,
  useState,
  useRef,
  RefObject,
  useMemo,
  Ref
} from "react";

// types:misc
type Nullable<T> = T | null;
// types:api
export type APIObject = Record<string, any>; // class instance, function, ...
export type APIGenerator = () => APIObject;
export type GetAPI<T> = (instance: Nullable<T>, prams?: any) => APIGenerator;
// types:configuration
export type Instantiate<T> = (
  node: Nullable<HTMLElement>,
  params?: any
) => Nullable<T>;
export type Destroy<T> = (instance: Nullable<T>, params?: any) => void;

export interface AptorConfiguration<T> {
  getAPI: GetAPI<T>;
  instantiate: Instantiate<T>;
  destroy: Destroy<T>;
  params?: any;
}

/**
 * react aptor(api-connector) a hook which connect api to react itself
 * @param ref - react forwarded ref
 * @param {Object} configuration - configuration object for setup
 * @param {Array} [deps=[]] - react dependencies array
 * @return domRef - can be bound to dom element
 */
export default function useAptor<T>(
  ref: Ref<APIObject>,
  configuration: AptorConfiguration<T>,
  deps: any[] = []
): RefObject<HTMLElement> {
  const [instance, setInstance] = useState<Nullable<T>>(null);
  const domRef = useRef<Nullable<HTMLElement>>(null);
  const { instantiate, destroy, getAPI, params } = configuration;

  useEffect(() => {
    const instanceReference = instantiate(domRef.current, params);
    setInstance(instanceReference);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      if (destroy) destroy(instanceReference, params);
    };
  }, deps);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const api = useMemo(() => getAPI(instance, params), [instance]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useImperativeHandle(ref, api, [api]);

  return domRef;
}