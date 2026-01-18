import { createContext } from "react";
import * as UE from 'ue'

export interface ReactorContextValue {
  rootWidgetTree: UE.WidgetTree;
}
export const ReactorContext = createContext<ReactorContextValue>({
    rootWidgetTree: null,
})
