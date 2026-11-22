// Shapes shared by the server and the chat in the browser (no server code here).

export interface ActionField {
  name: string;
  label: string;
  kind: 'select' | 'date' | 'text';
  options?: { value: string; label: string }[];
  required: boolean;
}

/** A university procedure the assistant prepared. Nothing runs until the student confirms. */
export interface ActionProposal {
  tool: string;
  title: string;
  description: string;
  fields: ActionField[];
  values: Record<string, string>;
  university: string;
}

export interface ActionResult {
  ok: boolean;
  text: string;
}
