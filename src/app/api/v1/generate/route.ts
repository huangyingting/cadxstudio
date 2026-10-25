import { NextRequest, NextResponse } from 'next/server';
import { executeReplicadScript, exportModelFile, synthesizeCadFromPrompt } from '@/lib/cad-kernel';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = String(body.prompt || 'Create a flanged bearing housing with 4 bolt holes');
    const format = (body.format || 'step').toLowerCase();
    const synthesized = synthesizeCadFromPrompt(prompt);
    const compiled = executeReplicadScript(synthesized.code, body.parameters);
    const exported = exportModelFile(
      compiled,
      format === 'stl' ? 'stl' : format === 'obj' ? 'obj' : format === 'gltf' ? 'gltf' : 'step'
    );

    return NextResponse.json({
      id: `gen_${Date.now().toString(36)}`,
      object: 'cad.generation',
      model: 'cadx-parametric-v2',
      created: Math.floor(Date.now() / 1000),
      name: compiled.name,
      engine: body.engine || 'replicad',
      parameters: compiled.parameters,
      parts: compiled.parts.map((p) => ({
        id: p.id,
        name: p.name,
        boundingBox: p.boundingBox,
      })),
      code: synthesized.code,
      export: {
        filename: exported.filename,
        mimeType: exported.mimeType,
        sizeBytes: exported.content.length,
        previewSnippet: exported.content.slice(0, 420),
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Generation failed' },
      { status: 400 }
    );
  }
}
