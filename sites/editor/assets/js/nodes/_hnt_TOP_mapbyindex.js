
export default function (hou) {
    class _hnt_TOP_mapbyindex extends hou.extend(hou._HoudiniBase).with(hou._MultiInputMixin) {
        static is_root = false;
        static id = 'TOP/Dependencies/mapbyindex';
        static category = '/TOP';
        static houdiniType = 'mapbyindex';
        static title = 'Map by Index';
        static icon = '/editor/assets/imgs/nodes/_hnt_TOP_mapbyindex.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['TOP'];
            const outputs = ['TOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('TOP/Dependencies/mapbyindex',_hnt_TOP_mapbyindex)
    return _hnt_TOP_mapbyindex
}
        