
export default function (hou) {
    class _hnt_LOP_begincontextoptionsblock extends hou._HoudiniBase {
        static is_root = false;
        static id = 'LOP/Other/begincontextoptionsblock';
        static category = '/LOP';
        static houdiniType = 'begincontextoptionsblock';
        static title = 'Begin Context Options Block';
        static icon = '/editor/assets/imgs/nodes/_hnt_LOP_begincontextoptionsblock.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['LOP'];
            const outputs = ['LOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "layerbreak", label: "Perform Layer Break", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('LOP/Other/begincontextoptionsblock',_hnt_LOP_begincontextoptionsblock)
    return _hnt_LOP_begincontextoptionsblock
}
        