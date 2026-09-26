// 子ども向けのタップ処理。ゲーム内のタップは click ではなくこれを使う
//
// click は指を置いてから離すまでに少しでも動くと発火しない。子どもの指はずれやすいので、
// 触れた瞬間 (pointerdown) に反応させる。複数の指で同時に触っても、それぞれ反応する。

type Targets = Element | Iterable<Element> | string;

/** el (要素・要素の集まり・セレクタ) がタップされたら fn を呼ぶ */
export function onTap<T extends Element = HTMLElement>(targets: Targets, fn: (el: T, e: Event) => void) {
  const els = typeof targets === 'string'
    ? document.querySelectorAll(targets)
    : targets instanceof Element ? [targets] : targets;
  for (const el of els) {
    el.addEventListener('pointerdown', (e) => {
      if ((e as PointerEvent).button > 0) return; // マウスの右クリックなどは無視
      e.preventDefault();
      fn(el as T, e);
    });
    // キーボード (Enter / Space) 操作は detail === 0 の click として来る
    el.addEventListener('click', (e) => {
      if ((e as MouseEvent).detail === 0) fn(el as T, e);
    });
  }
}
