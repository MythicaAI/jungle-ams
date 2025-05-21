import React, { useEffect, useState } from 'react';
import hou,{ dictionary } from '../types/Houdini';
import { useWindowSize } from '../util/useWindowSize';

export interface MenuParmProps {
    template: hou.MenuParmTemplate;
    data: dictionary;
    onChange: (formData: dictionary) => void; 
}

export const MenuParm: React.FC<MenuParmProps> = ({ template, data, onChange }) => {
    const {
        label,
        menu_items = [],
        menu_labels = [],
        default_value = "",
        icon_names = [],
        is_menu = false,
        is_button_strip = false,
        strip_uses_icons = false,
    } = template;

    const { currentWidth } = useWindowSize();
    const isMobileSize = currentWidth <= 700;
    
    // Determine initial selected value
    const getDefaultValue = () => {
        return data[template.name] || menu_items.includes(default_value) ? default_value : (menu_items[0] || "");
    }

    const [selectedValue, setSelectedValue] = useState<string>(getDefaultValue);

    useEffect(() => {
    const myData = data[template.name] as string || getDefaultValue();
    if (myData && selectedValue !== myData) {
        setSelectedValue(myData);
    }
    }, [data[template.name]]);
    
    const handleChange = (val: string) => {
        setSelectedValue(val);

        const ret: { [key: string]: string } = {};
        ret[template.name] = val;
        onChange(ret);
    }

    const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleChange(e.target.value);
    };

    const handleButtonClick = (val: string) => {
        handleChange(val);
    };


    // Helper to get label for a given menu item index
    const getLabelForItem = (item: string, index: number) => {
        return menu_labels[index] ?? item;
    };

    // If using icons in a strip, we might render an icon next to the label
    const renderButtonItem = (item: string, index: number) => {
        const isActive = selectedValue === item;
        const iconName = strip_uses_icons && icon_names[index] ? icon_names[index] : null;
        return (
            <button
                key={index}
                className={`menu-button-item ${isActive ? 'active' : ''}`}
                onClick={() => handleButtonClick(item)}
            >
                {iconName && <img src={iconName} alt={item} style={{ marginRight: '5px' }} />}
                {getLabelForItem(item, index)}
            </button>
        );
    };

    return (
        <div className="menu-parm" style={!isMobileSize ? { display: 'flex', gap: '10px' } : undefined}>
            <label className="menu-label" style={!isMobileSize ? { 
                width: '100px', 
                textAlign: 'right',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-end',
                height: 'auto',
                minHeight: '28px',
                margin: 0,
                wordWrap: 'break-word',
                overflowWrap: 'break-word'
            } : undefined}
            title={`variable: ${template.name}`}
            >{label}</label>
            <div className="menu-content" style={!isMobileSize ? { flex: 1, width: '100%' } : undefined}>
                {is_button_strip && (
                    <div className="menu-button-strip">
                        {menu_items.map((item, index) => renderButtonItem(item, index))}
                    </div>
                )}

                {!is_button_strip && (is_menu || (!is_menu && !is_button_strip)) && (
                    <select 
                        value={selectedValue} 
                        onChange={handleSelectChange} 
                        className="menu-select"
                        style={{ width: '100%' }}
                    >
                        {menu_items.map((item, index) => (
                            <option key={index} value={item}>
                                {getLabelForItem(item, index)}
                            </option>
                        ))}
                    </select>
                )}
            </div>
        </div>
    );
};

export default MenuParm;
