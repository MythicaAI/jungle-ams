import React, { useEffect, useState } from 'react';
import hou from '../../types/Houdini';
import FolderParm from './FolderParm';
import { dictionary } from '../../types/Automation';

export interface FolderSetParmProps {
    template: hou.FolderSetParmTemplate;
    onChange: (formData: dictionary) => void; // Callback for value changes
    runtimeData?: {
        activeFolder: string | null;
    }
}

const FolderSetParm: React.FC<FolderSetParmProps> = ({ template, onChange, runtimeData = { activeFolder: null } }) => {
    const [activeFolder, setActiveFolder] = useState<string | null>(template.parm_templates[0].name);

    const handleFolderActivation = (folderName: string) => {
        setActiveFolder(folderName); // Update local active state
    }

    useEffect(() => {
        runtimeData.activeFolder = activeFolder;
    }, [activeFolder, runtimeData, template.parm_templates]);

    return (
        <div className="folder-container">
            {/* Tab header */}
            <div className="folder-tabs">
                {template.parm_templates.map((folder: hou.FolderParmTemplate, index) => (
                    <div
                        key={index}
                        className={`folder-tab ${activeFolder === folder.name ? 'active' : ''}`}
                        onClick={() => handleFolderActivation(folder.name)}
                    >
                        {folder.label}
                    </div>
                ))}
            </div>

            {/* Only render the active folder */}
            <div className="folder-content">
                {template.parm_templates.map((folder: hou.FolderParmTemplate, index) => {
                    if (folder.name === activeFolder) {
                        return (
                            <div key={index} className={`folder-item active`}>
                                <FolderParm onChange={onChange} template={folder} />
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default FolderSetParm;
