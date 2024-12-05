
import ast
import re

def transpiler(code):
    class Transpiler(ast.NodeVisitor):
        def __init__(self):
            self.transpiled_code = []
            self.declared_variables = set()

        def visit_Assign(self, node):
            # Handles variable assignments, e.g., varname = Something()
            if len(node.targets) == 1 and isinstance(node.targets[0], ast.Name):
                var_name = node.targets[0].id
                value = node.value
                declaration_prefix = 'let ' if var_name not in self.declared_variables else ''
                self.declared_variables.add(var_name)
                if isinstance(value, ast.Call) and isinstance(value.func, ast.Attribute) and value.func.attr == 'ParmTemplateGroup':
                    self.transpiled_code.append(f'{declaration_prefix}{var_name} = new hou.{value.func.attr}();\n')
                elif isinstance(value, ast.Call) and isinstance(value.func, ast.Attribute) and value.func.attr.endswith('ParmTemplate'):
                    self.handle_constructor(var_name, value, declaration_prefix)
                else:
                    self.transpiled_code.append(f'{declaration_prefix}{var_name} = {self.generic_visit(value)};\n')
            self.generic_visit(node)

        def visit_Expr(self, node):
            # This will handle standalone method calls
            if isinstance(node.value, ast.Call):
                call_node = node.value
                if isinstance(call_node.func, ast.Attribute):
                    func_name = call_node.func.attr
                    call_args = ', '.join(self.handle_value(arg) for arg in call_node.args)
                    call_line = f'{call_node.func.value.id}.{func_name}({call_args});\n'
                    self.transpiled_code.append(call_line)
            self.generic_visit(node)

        def handle_constructor(self, var_name, call_node, declaration_prefix):
            class_name = call_node.func.attr
            # Maps class names to their ordinal constructor parameters
            constructor_params = {
                'ButtonParmTemplate': ['name', 'label'],
                'DataParmTemplate': ['name', 'label', 'num_components'],
                'FloatParmTemplate': ['name', 'label', 'num_components'],
                'FolderParmTemplate': ['name', 'label', 'parm_templates'],
                'FolderSetParmTemplate': ['name', 'folder_names'],
                'IntParmTemplate': ['name', 'label', 'num_components'],
                'LabelParmTemplate': ['name', 'label', 'column_labels'],
                'MenuParmTemplate': ['name', 'label', 'menu_items'],
                'RampParmTemplate': ['name', 'label', 'ramp_parm_type'],
                'SeparatorParmTemplate': ['name'],
                'StringParmTemplate': ['name', 'label', 'num_components'],
                'ToggleParmTemplate': ['name', 'label']
            }

            # Initialize argument handling
            args_list = []
            kwargs_dict = {}

            # Process ordinal (positional) arguments
            params_list = constructor_params.get(class_name, [])
            for i, arg in enumerate(call_node.args):
                if i < len(params_list):  # Ensure we do not process more args than defined
                    param_name = params_list[i]
                    args_list.append(f'{param_name}: {self.handle_value(arg)}')
                else:
                    # Handle extra positional args not in the ordinal list as normal args
                    args_list.append(self.handle_value(arg))

            # Process keyword (named) arguments
            for kw in call_node.keywords:
                kwargs_dict[kw.arg] = self.handle_value(kw.value)

            # Combine all arguments into a single string
            args_str = ', '.join(args_list + [f'{k}: {v}' for k, v in kwargs_dict.items()])
            self.transpiled_code.append(f'{declaration_prefix}{var_name} = new hou.{class_name}({{{args_str}}});\n')

        def handle_value(self, node):
            if isinstance(node, ast.Constant):
                if node.value is None:
                    return 'null'  # Handle None values correctly
                elif isinstance(node.value, bool):
                    return str(node.value).lower()  # Ensure Boolean values are lowercase
                elif isinstance(node.value, str):
                    # Use repr to handle the string and manually adjust quotes
                    # This preserves the original escape characters and adds additional escaping where necessary
                    escaped_string = repr(node.value)
                    # Ensure the string is enclosed in double quotes
                    if escaped_string.startswith("'") and escaped_string.endswith("'"):
                        escaped_string = '"' + escaped_string[1:-1].replace('"', '\\"') + '"'
                    return escaped_string
                else:
                    return str(node.value)  # Directly return the string representation for other types
            elif isinstance(node, ast.Name):
                return node.id
            elif isinstance(node, ast.Call):
                func_name = self.handle_value(node.func)
                args = ', '.join(self.handle_value(arg) for arg in node.args)
                return f'{func_name}({args})'
            elif isinstance(node, ast.Attribute):
                value = self.handle_value(node.value)
                attr = node.attr
                return f'{value}.{attr}'
            elif isinstance(node, ast.List) or isinstance(node, ast.Tuple):
                elements = ', '.join(self.handle_value(el) for el in node.elts)
                return f'[{elements}]'
            elif isinstance(node, ast.Dict):
                keys = [self.handle_value(k) for k in node.keys]
                values = [self.handle_value(v) for v in node.values]
                dict_elements = ', '.join(f'{k}: {v}' for k, v in zip(keys, values))
                return f'{{{dict_elements}}}'
            else:
                return 'null'

    def preprocess(code):
        pattern_items = r'(item_generator_script)="(.*?)", \1'
        pattern_defaults = r"(default_expression)='(.*?)', \1"

        def replace_with_double_quotes(match):
            # Extract the content inside the single quotes, correctly handling escaped single quotes
            match_type = match.group(1)
            inner_content = match.group(2)
            # Unescape single quotes for correct double quote escaping
            inner_content = inner_content.replace("\\'", "'")
            # Escape internal double quotes that are not already escaped
            inner_content = re.sub(r'(?<!\\)"', r'\\"', inner_content)
            inner_content = re.sub(r'\n', r'\\\n', inner_content)
                        
            # Replace with double quotes and escape the internal content
            return f'{match_type}="{inner_content}", {match_type}'

        # Apply the regex substitution
        code = re.sub(pattern_items, replace_with_double_quotes, code, flags=re.DOTALL)
        code = re.sub(pattern_defaults, replace_with_double_quotes, code, flags=re.DOTALL)
        code = code.replace('""""','""')
        
        return code

    tree = ast.parse(preprocess(code))
    transpiler = Transpiler()
    transpiler.visit(tree)
    jscode = ''.join(transpiler.transpiled_code).replace('\n','\n\t')
    jscode = f"""
const parmTemplateGroup: typeof hou.ParmTemplateGroup = () => {{
    {jscode}
    return hou_parm_template_group;
}}  
    """ 
    return jscode
