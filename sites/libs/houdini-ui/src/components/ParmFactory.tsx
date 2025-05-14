import React from 'react';
import hou, { dictionary } from '../types/Houdini';
import FloatParm from './FloatParm';
import FolderParm from './FolderParm';
import FolderSetParm from './FolderSetParm';
import IntParm from './IntParm';
import LabelParm from './LabelParm';
import MenuParm from './MenuParm';
import RampParm from './RampParm';
import SeparatorParm from './SeparatorParm';
import StringParm from './StringParm';
import ToggleParm from './ToggleParm';

export interface ParmFactoryProps {
  parmTemplate: hou.ParmTemplate;
  data: dictionary;
  onChange: (formData: dictionary) => void; // Callback for value changes
  onFileUpload?: (formData: Record<string, File>, callback: (file_id: string) => void) => void;
}

export type ParmFactory = React.ComponentType<ParmFactoryProps>;


export const DefaultParmFactory: React.FC<ParmFactoryProps> = (props) => {
  return parmFactoryMethod(props);
};

export const ParmFactoryContext =  
  React.createContext<ParmFactory>(
    DefaultParmFactory
);

export const ParmFactoryProvider = ParmFactoryContext.Provider;

export const parmFactoryMethod = (props: ParmFactoryProps): React.ReactNode => {
  const { parmTemplate, data, onChange, onFileUpload } = props;
  switch (parmTemplate.param_type) {
    case hou.parmTemplateType.Folder:
      return (
        <FolderParm
          key={parmTemplate.id}
          data={data}
          onChange={onChange}
          onFileUpload={onFileUpload}
          template={parmTemplate as hou.FolderParmTemplate}
        />
      );
    case hou.parmTemplateType.FolderSet:
      return (
        <FolderSetParm
          key={parmTemplate.id}
          data={data}
          onChange={onChange}
          onFileUpload={onFileUpload}
          template={parmTemplate as hou.FolderSetParmTemplate}
        />
      );
    case hou.parmTemplateType.String:
      return (
        <StringParm
          key={parmTemplate.id}
          data={data}
          onChange={onChange}
          onFileUpload={onFileUpload}
          template={parmTemplate as hou.StringParmTemplate}
        />
      );
    case hou.parmTemplateType.Float:
      return (
        <FloatParm
          key={parmTemplate.id}
          data={data}
          onChange={onChange}
          template={parmTemplate as hou.FloatParmTemplate}
        />
      );
    case hou.parmTemplateType.Int:
      return (
        <IntParm
          key={parmTemplate.id}
          data={data}
          onChange={onChange}
          template={parmTemplate as hou.IntParmTemplate}
        />
      );
    case hou.parmTemplateType.Toggle:
      return (
        <ToggleParm
          key={parmTemplate.id}
          data={data}
          onChange={onChange}
          template={parmTemplate as hou.ToggleParmTemplate}
        />
      );
    case hou.parmTemplateType.Separator:
      return (
        <SeparatorParm
          key={parmTemplate.id}
          template={parmTemplate as hou.SeparatorParmTemplate}
        />
      );
    case hou.parmTemplateType.Label:
      return (
        <LabelParm
          key={parmTemplate.id}
          template={parmTemplate as hou.LabelParmTemplate}
        />
      );
    case hou.parmTemplateType.Menu:
      return (
        <MenuParm
          key={parmTemplate.id}
          data={data}
          onChange={onChange}
          template={parmTemplate as hou.MenuParmTemplate}
        />
      );
    case hou.parmTemplateType.Ramp:
      return (
        <RampParm
          key={parmTemplate.id}
          data={data}
          onChange={onChange}
          template={parmTemplate as hou.RampParmTemplate}
        />
      );
    case hou.parmTemplateType.File:
      return <></>;
    default:
      return (
        <div key={parmTemplate.id}>
          Not Implemented: {parmTemplate.param_type}
        </div>
      );
  }
}