
export default function (hou) {
    class _hnt_SOP_polypath extends hou.extend(hou._HoudiniBase).with(hou._SubgraphMixin) {
        static is_root = false;
        static id = 'SOP/Geometry/Polygons/polypath';
        static category = '/SOP';
        static houdiniType = 'polypath';
        static title = 'PolyPath';
        static icon = '/editor/assets/imgs/nodes/_hnt_SOP_polypath.svg';
        constructor() {
            super();
            this.flags['houdini_type'] = this.__proto__.constructor.houdiniType;
            
            const inputs = ['SOP'];
            const outputs = ['SOP'];

            for(var i=0;i<inputs.length;i++) this.addInput(''+i,inputs[i]);        
            for(var j=0;j<outputs.length;j++) this.addOutput(''+j,outputs[j]);
        }
        parmTemplatesInit() {
            let hou_parm_template_group = new hou.ParmTemplateGroup();
			this.parmTemplateGroup = hou_parm_template_group;
			let hou_parm_template = new hou.ToggleParmTemplate({name: "connectends", label: "Connect End Points", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.FloatParmTemplate({name: "maxendptdist", label: "Max Distance", num_components: 1, default_value: [0.01], min: 0, max: 1, min_is_strict: true, max_is_strict: false, look: hou.parmLook.Regular, naming_scheme: hou.parmNamingScheme.Base1});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ connectends == off }");
			hou_parm_template.setTags({"units": "m1"});
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "connectonlytoends", label: "Connect Only To Other End Points", default_value: true});
			hou_parm_template.setConditional(hou.parmCondType.DisableWhen, "{ connectends == off }");
			hou_parm_template_group.append(hou_parm_template);
			hou_parm_template = new hou.ToggleParmTemplate({name: "closeloops", label: "Make Isolated Loops Closed", default_value: false});
			hou_parm_template_group.append(hou_parm_template);
			
            this.parmTemplateGroup = hou_parm_template_group;
            this.parmTemplateGroup.linkNode(this);
        }
    }
    hou.registerType('SOP/Geometry/Polygons/polypath',_hnt_SOP_polypath)
    return _hnt_SOP_polypath
}
        