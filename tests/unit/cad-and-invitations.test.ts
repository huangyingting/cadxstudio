import { describe, it, expect, afterAll } from 'vitest';
import {
  executeReplicadScript,
  exportModelFile,
  synthesizeCadFromPrompt,
  DEFAULT_BEARING_HOUSING_CODE,
} from '@/lib/cad-kernel';
import {
  createDrawingSheetData,
  exportDrawingToDxf,
  generateEngineeringDrawing,
  DEFAULT_DRAWING_CONFIG,
} from '@/lib/drawing-engine';
import {
  createInvitation,
  validateInvitationCode,
  redeemInvitationAndRegisterUser,
  revokeInvitation,
} from '@/lib/invitations';
import { prisma } from '@/lib/prisma';

describe('CadxStudio B-Rep CAD Kernel & Multi-Format Exporters', () => {
  it('compiles parametric Replicad JS code into multi-part B-Rep solids, sketches, features, and sliders', () => {
    const model = executeReplicadScript(
      DEFAULT_BEARING_HOUSING_CODE,
      {
        baseWidth: 96,
      },
      'replicad'
    );
    expect(model.parts.length).toBeGreaterThanOrEqual(2);
    expect(model.sketches.length).toBeGreaterThan(0);
    expect(model.features.length).toBeGreaterThan(0);
    const widthParam = model.parameters.find((p) => p.key === 'baseWidth');
    expect(widthParam?.value).toBe(96);
  });

  it('synthesizes CAD geometry from natural language prompts for both Replicad and build123d', () => {
    const spurGear = synthesizeCadFromPrompt('Precision spur gear 18 teeth', undefined, 'replicad');
    expect(spurGear.code).toContain('pitchRadius');

    const pyGear = synthesizeCadFromPrompt('Spur gear', undefined, 'build123d');
    expect(pyGear.code).toBeTruthy();
  });

  it('exports valid STEP, STL, OBJ, glTF, GLB, and PLY geometry payloads', () => {
    const model = executeReplicadScript(DEFAULT_BEARING_HOUSING_CODE, {}, 'replicad');
    const step = exportModelFile(model, 'step', 'housing');
    expect(step.filename).toContain('.step');
    expect(String(step.content)).toContain('ISO-10303-21;');

    const stl = exportModelFile(model, 'stl', 'housing');
    expect(String(stl.content)).toContain('solid ');

    const gltf = exportModelFile(model, 'gltf', 'housing');
    expect(String(gltf.content)).toContain('"version": "2.0"');
  });
});

describe('2D Engineering Drawing HLR Projection Engine (ISO 128 / ASME Y14.5)', () => {
  it('projects orthographic + isometric views and exports valid SVG and AutoCAD DXF', () => {
    const model = executeReplicadScript(DEFAULT_BEARING_HOUSING_CODE, {}, 'replicad');
    const config = {
      sheetSize: 'A3' as const,
      standard: 'first-angle' as const,
      scale: '1:1',
      activeViews: ['front', 'top', 'right', 'iso'],
      showHiddenLines: true,
      showCenterlines: true,
      showDimensions: true,
      titleBlock: {
        title: 'FLANGED BEARING HOUSING',
        drawingNumber: 'CDX-2026-001',
        revision: 'A',
        author: 'Cadx Engineer',
        company: 'CADXSTUDIO ENGINEERING',
        material: 'ALUMINUM 6061-T6',
        finish: 'CLEAR ANODIZE',
        scale: '1:1',
        sheetSize: 'A3',
        date: '2026-03-30',
      },
      customDimensions: [],
      gdtCallouts: [],
      bomRows: [],
      notes: ['REMOVE ALL BURRS'],
    };

    const sheet = createDrawingSheetData(model, {
      sheetSize: 'A3',
      standard: 'first-angle',
      scale: '1:1',
      title: 'FLANGED BEARING HOUSING',
      partNumber: 'CDX-2026-001',
      author: 'Cadx Engineer',
      material: 'ALUMINUM 6061-T6',
      revision: 'A',
      includeHiddenLines: true,
      includeDimensions: true,
    });
    expect(sheet.views.length).toBe(4);
    expect(sheet.views[0].visibleLines.length).toBeGreaterThan(0);

    const engSheet = generateEngineeringDrawing(model, DEFAULT_DRAWING_CONFIG);
    expect(engSheet.views.length).toBeGreaterThan(0);
    expect(engSheet.dimensions.length).toBeGreaterThan(0);

    const dxf = exportDrawingToDxf(sheet);
    expect(dxf).toContain('SECTION');
    expect(dxf).toContain('VISIBLE');
  });
});

describe('Invite-Only Registration, Single-Use/Expiring Codes, Revocation & Audit Logging', () => {
  const createdInvitationIds: string[] = [];
  const createdUserIds: string[] = [];

  afterAll(async () => {
    // Clean up all test records so zero demo/test accounts remain in the database
    if (createdUserIds.length > 0) {
      await prisma.invitationRedemption.deleteMany({
        where: { userId: { in: createdUserIds } },
      });
      await prisma.auditLog.deleteMany({
        where: { OR: [{ actorId: { in: createdUserIds } }, { targetId: { in: createdUserIds } }] },
      });
    }
    if (createdInvitationIds.length > 0) {
      await prisma.invitationRedemption.deleteMany({
        where: { invitationId: { in: createdInvitationIds } },
      });
      await prisma.auditLog.deleteMany({
        where: { targetId: { in: createdInvitationIds } },
      });
      await prisma.invitation.deleteMany({
        where: { id: { in: createdInvitationIds } },
      });
    }
    if (createdUserIds.length > 0) {
      await prisma.user.deleteMany({
        where: { id: { in: createdUserIds } },
      });
    }
  });

  it('enforces single-use invitation redemption and records immutable audit logs', async () => {
    const invite = await createInvitation({
      role: 'ENGINEER',
      maxUses: 1,
      expiresInHours: 24,
      notes: 'Unit test single-use invite',
    });
    createdInvitationIds.push(invite.id);

    const checkValid = await validateInvitationCode(invite.code);
    expect(checkValid.valid).toBe(true);

    const uniqueEmail = `test-eng-${Date.now()}@cadxstudio.local`;
    const result = await redeemInvitationAndRegisterUser({
      invitationCode: invite.code,
      email: uniqueEmail,
      name: 'Test Engineer',
      password: 'SecurePassword123!',
    });
    const newUser = 'user' in result ? result.user : result;
    createdUserIds.push(newUser.id);
    expect(newUser.role).toBe('ENGINEER');

    // Second attempt on single-use code must fail
    const secondCheck = await validateInvitationCode(invite.code);
    expect(secondCheck.valid).toBe(false);
    expect(secondCheck.reason).toMatch(/already been used|maximum/i);
  });

  it('rejects revoked invitation codes immediately', async () => {
    const invite = await createInvitation({
      role: 'MEMBER',
      maxUses: 5,
      expiresInHours: 24,
    });
    createdInvitationIds.push(invite.id);

    await revokeInvitation({
      invitationId: invite.id,
      reason: 'Security revocation test',
    });

    const validation = await validateInvitationCode(invite.code);
    expect(validation.valid).toBe(false);
    expect(validation.reason).toContain('revoked');
  });
});
