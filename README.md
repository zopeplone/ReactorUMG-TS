# ReactorUMG

ReactorUMG 是一个运行在 Unreal Engine + puerts 环境中的 React 渲染器，利用 `react-reconciler` 将 JSX/TSX 直接转成原生 UMG Widget，帮助你用熟悉的前端范式构建游戏 UI 和编辑器工具界面。

## 功能特性
- React 18 + `react-reconciler` 驱动，底层通过原生 `UE.UMGManager` 创建、更新、销毁 Widget。
- HTML 风格标签：`div`/`section`/`article`/`form`、`button`、`input`、`textarea`、`select`、`img`、`progress`、`style`，支持 `className`/`id`/属性选择器。
- UMG 组件封装：CanvasPanel、Overlay、Flex/Grid/UniformGrid、WrapBox、ScrollBox、Border、Button、TextBlock、RichTextBlock、CheckBox、ComboBox、ProgressBar/RadialSlider/Slider/SpinBox、SafeZone、ScaleBox、SizeBox、RetainerBox、InvalidationBox、ExpandableArea、ListView/TreeView/TileView、Viewport、Rive、Spine 等（详见 `components.js`）。
- 样式解析接近 CSS：布局（flex/grid/canvas/overlay）、gap/margin/padding、宽高及 min/max、背景图与颜色、字体、透明度、transform/translate/rotate/scale、object-fit、zIndex、overflow、对齐方式等；支持 `<style>` 标签注册全局样式。
- 资源与交互：图片异步加载（本地/网络/UE 资源）、按钮与输入事件回调、进度与滑杆数值绑定、RetainerBox/InvalidationBox 性能组件、Rive 与 Spine 动画挂载。

## 运行要求
- Unreal Engine 项目中已接入 puerts，并提供 `UE.UMGManager`（通常由原生插件或 ReactorUIWidget 提供）。
- Node 侧依赖：React 18.x、`react-reconciler` ^0.28（已在 `package.json` 声明）。

## 安装
```bash
npm install reactorumg
# 或将编译后的脚本放入 Content/JavaScript 供 puerts 加载
```

## 快速上手
```ts
import React from 'react';
import { ReactorUMG, CanvasPanel, Button, TextBlock } from 'reactorumg';

export function mount(widget: UE.UserWidget) {
  const root = ReactorUMG.render(
    widget.WidgetTree,
    <CanvasPanel style={{ width: '100%', height: '100%', padding: 24 }}>
      <style>{`
        .title { font-size: 24px; color: #f8f8f8; }
        .primary { padding: 12px 18px; background: #3b82f6; border-radius: 8px; color: #fff; }
      `}</style>

      <TextBlock className="title">Hello ReactorUMG</TextBlock>
      <Button className="primary" onClick={() => console.log('clicked')}>
        点击开始
      </Button>
    </CanvasPanel>
  );

  return () => ReactorUMG.release(root);
}
```

## 样式与布局
- `div`/语义化标签默认使用 flex 布局；`style.display='grid'` 启用 CSS Grid；`style.position='relative'` 触发 overlay；CanvasPanel 适合绝对定位；WrapBox 支持自动换行。
- 支持 `className`、`id`、属性选择器与 `<style>` 标签注入的样式，后者可用后代选择器；inline style 拥有最高优先级。
- 常用属性覆盖：margin/padding/gap、宽高及 min/max、background（颜色/图片/size/repeat/position）、color 与 font、border/outline、transform/translate/rotate/scale、opacity、object-fit、overflow、justify/align、自适应尺寸与 zIndex。

## 组件速览
- HTML 风格：`div`、`span`、`p`、`button`、`input`、`textarea`、`select`、`img`、`progress`、`style`。
- UMG：CanvasPanel、Grid、Overlay、UniformGrid、WrapBox、VerticalBox、ScrollBox、Border、Button、CheckBox、ComboBox、ProgressBar、RadialSlider、Slider、SpinBox、SafeZone、ScaleBox、SizeBox、Spacer、RetainerBox、InvalidationBox、ExpandableArea、ListView、TreeView、TileView、Viewport、Rive、Spine、Throbber/CircularThrobber、Image、TextBlock、RichTextBlock 等。
- 事件：按钮点击/按压、输入提交、滑杆/进度变化、下拉选项切换、动画事件等通过 props 传入回调。

## 卸载
调用 `ReactorUMG.release(root)` 可从 WidgetTree 移除界面并释放节点。

## 许可证
MIT License，详见 `LICENSE`。
