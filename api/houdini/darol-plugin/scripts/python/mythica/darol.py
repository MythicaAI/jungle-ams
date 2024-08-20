import hou
import os
"""
Helper functions for darol automation scripts. From a hython shell
scripts can start and end a houdini session, making sure that the
actions of the script are captured in an hip file consistently. This
can be extended to later provide other common utilities. 
"""
def start_houdini(hip):
    # Create a new Houdini scene.
    hou.hipFile.clear(suppress_save_prompt=True)
    # Save the file to force $HIP to point to output location
    hou.hipFile.save(file_name=hip)

def end_houdini(hip):
    # Save the file.
    hou.hipFile.save(file_name=hip)
    #print(f"File saved to {hip}")

def remove_file(hip):
    try:
        os.remove(hip)
        #print(f"File {hip} has been removed successfully.")
    except FileNotFoundError:
        print(f"File {hip} not found.")
    except Exception as e:
        print(f"Error removing file {hip}: {e}")

def create_container_for_nodetype(node_type, parent):
    category = node_type.category().name().upper()
    out = None
    """Create the appropriate container node based on the node type category."""
    if category == 'SOP':
        out = parent.createNode('geo', 'geo_container')
    elif category == 'DOP':
        out = parent.createNode('dopnet', 'dopnet_container')
    elif category == 'VOP':
        out = parent.createNode('vopnet', 'vopnet_container')
    elif category == 'SHOP':
        out = parent.createNode('shopnet', 'shopnet_container')
    elif category == 'ROP':
        out = parent
    elif category == 'CHOP':
        out = parent.createNode('chopnet', 'chopnet_container')
    elif category == 'TOP':
        out = parent.createNode('topnet', 'topnet_container')
    else:
        raise ValueError(f"Unsupported node type category: {category}")

    return out
