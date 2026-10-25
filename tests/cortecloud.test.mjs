import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildDesign } from '../src/lib/build.ts';
import { toCortecloud, tapeMetres } from '../src/lib/export/cortecloud.ts';
import { designs } from '../src/designs/index.ts';

const models = designs.map((spec) => buildDesign(spec));

for (const model of models) {
  const { spec } = model,
    label = (suffix) => `${spec.id}: ${suffix}`,
    file = toCortecloud(model);

  test(label('one line per cut group, with the same quantities'), () => {
    assert.equal(file.parts.length, model.groups.length);
    for (const [i, part] of file.parts.entries()) {
      const group = model.groups[i];
      assert.equal(part.quantity, group.quantity);
      assert.equal(part.c, group.part.cut[0]);
      assert.equal(part.l, group.part.cut[1]);
      assert.equal(part.complement, group.ids.join('-'));
      assert.ok(part.c > 0 && part.l > 0, part.complement);
    }
  });

  test(label('the file never invents a board or a banding'), () => {
    const bare = toCortecloud(model);
    for (const part of bare.parts) {
      for (const side of ['c1', 'c2', 'l1', 'l2']) {
        assert.equal(part[side], null, `${part.complement} ${side}`);
      }
      assert.equal(part.machining, null);
    }
  });

  test(label('a banded side carries the tape, a bare side stays null'), () => {
    const named = toCortecloud(model, {
      boards: Object.fromEntries(spec.materials.map((m) => [m.id, `B-${m.id}`])),
      tapes: Object.fromEntries(spec.materials.map((m) => [m.id, `T-${m.id}`])),
    });
    for (const [i, part] of named.parts.entries()) {
      const { edging, materialId } = model.groups[i].part,
        takes = spec.materials.find((m) => m.id === materialId)?.banding !== false,
        want = (key) => (takes && edging?.[key] ? `T-${materialId}` : null);
      assert.equal(part.material, `B-${materialId}`);
      assert.equal(part.c1, want('L1'), `${part.complement} c1`);
      assert.equal(part.c2, want('L2'), `${part.complement} c2`);
      assert.equal(part.l1, want('A1'), `${part.complement} l1`);
      assert.equal(part.l2, want('A2'), `${part.complement} l2`);
    }
  });
}

test('bajo-mesada: the order matches the cut list it came from', () => {
  const model = models.find((m) => m.spec.id === 'bajo-mesada');
  const file = toCortecloud(model, {
    boards: { melamina18: 'FMBM18' },
    tapes: { melamina18: 'ABS Blanco' },
  });

  assert.equal(
    file.parts.reduce((n, p) => n + p.quantity, 0),
    14,
  );
  assert.equal(tapeMetres(file).toFixed(2), '9.63');

  const door = file.parts.find((p) => p.complement === 'P01-P02');
  assert.deepEqual(
    [door.c1, door.c2, door.l1, door.l2],
    ['ABS Blanco', 'ABS Blanco', 'ABS Blanco', 'ABS Blanco'],
    'both doors are banded all the way round',
  );

  const shelf = file.parts.find((p) => p.complement === 'E01-E02');
  assert.deepEqual(
    [shelf.c1, shelf.c2, shelf.l1, shelf.l2],
    [null, null, 'ABS Blanco', null],
    'the niche shelves are banded on the short front edge only',
  );
});
