import * as React from 'react';
import * as ReactDOM from 'react-dom';
import renderComponent from './renderComponent';

export interface Module {
  name: string;
  url: string | string[];
  component?: React.ReactElement;
  mount?: (Component: any, targetNode: HTMLElement, props?: any) => void;
  unmount?: (targetNode: HTMLElement) => void;
}

export interface RenderProps {
  getModules: () => Module[];
  mountModule: (targetModule: Module, targetNode: HTMLElement, props?: any) => void;
  unmoutModule: (targetModule: Module, targetNode: HTMLElement) => void;
}

const { useEffect, useRef } = React;

/**
 * default render compoent, mount all modules
 */
const DefaultRender = ({ getModules, mountModule, unmoutModule }: RenderProps) => {
  const modules = getModules();

  const renderNodeList: React.MutableRefObject<HTMLDivElement>[] = modules.map(() => useRef(null));

  useEffect(() => {
    const unmountFn = modules.map((module, index) => {
      // get ref current node
      const renderNode = renderNodeList[index].current;
      // mount module
      mountModule(module, renderNode, {});
      return () => unmoutModule(module, renderNode);
    });

    return () => {
      unmountFn.forEach(fn => fn());
    };
  }, []);

  return (<div>
    {renderNodeList.map((node, index) => (
      <div key={modules[index].name || index} ref={node} id={modules[index].name} />
    ))}
  </div>);
};

/**
 * support react module render
 */
const defaultMount = (Component: any, targetNode: HTMLElement, props?: any) => {
  ReactDOM.render(renderComponent(Component, props), targetNode);
};

/**
 * default unmount function
 */
const defaultUnmount = (targetNode: HTMLElement) => {
  // do something
};

/**
 * mount module function
 */
const mountModule = (targetModule: Module, targetNode: HTMLElement) => {
  // use module mount or default mount, config mount > self module mount > default mount
  const mount = targetModule.mount || defaultMount;
  return mount(targetModule.component, targetNode);
};

/**
 * unmount module function
 */
const unmoutModule = (targetModule: Module, targetNode: HTMLElement) => {
  const mount = targetModule.unmount || defaultUnmount;
  return mount(targetNode);
};

/**
 * Render Modules, compatible with Render and <Render>
 */
export default function renderModules(modules: Module[], render: any): React.ReactElement {
  const getModules: () => Module[] = () => {
    return modules;
  };

  const Component = typeof render === 'function' ? render : DefaultRender;

  return <Component getModules={getModules} mountModule={mountModule} unmoutModule={unmoutModule} />
};
