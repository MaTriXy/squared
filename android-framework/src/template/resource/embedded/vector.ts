export default `
<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android" {~namespace} android:name="{&name}" android:width="{&width}" android:height="{&height}" android:viewportWidth="{&viewportWidth}" android:viewportHeight="{&viewportHeight}" android:alpha="{~alpha}">
<<A>>
	##group-start:0##
	<group android:name="{~groupName}" android:rotation="{~rotation}" android:pivotX="{~pivotX}" android:pivotY="{~pivotY}" android:scaleX="{~scaleX}" android:scaleY="{~scaleY}" android:translateX="{~translateX}" android:translateY="{~translateY}">
	##group-start##
	<<AA>>
		##render-start:1##
		<group android:name="{~groupName}" android:rotation="{~rotation}" android:pivotX="{~pivotX}" android:pivotY="{~pivotY}" android:scaleX="{~scaleX}" android:scaleY="{~scaleY}" android:translateX="{~translateX}" android:translateY="{~translateY}">
		##render-start##
		<<clipPaths>>
		<clip-path android:name="{~clipPathName}" android:pathData="{~clipPathData}" />
		<<clipPaths>>
		<path android:name="{&name}" android:pathData="{&d}"
			android:fillColor="{~fill}" android:fillAlpha="{~fillOpacity}" android:fillType="{~fillRule}"
			android:strokeColor="{~stroke}" android:strokeAlpha="{~strokeOpacity}" android:strokeWidth="{~strokeWidth}"
			android:strokeLineCap="{~strokeLinecap}" android:strokeLineJoin="{~strokeLinejoin}" android:strokeMiterLimit="{~strokeMiterlimit}">
		<<fillPattern>>
			<aapt:attr name="android:fillColor">
			<<gradients>>
				<gradient android:type="{&type}" android:startColor="@color/{~startColor}" android:endColor="@color/{~endColor}" android:centerColor="@color/{~centerColor}" android:startX="{~startX}" android:startY="{~startY}" android:endX="{~endX}" android:endY="{~endY}" android:centerX="{~centerX}" android:centerY="{~centerY}" android:gradientRadius="{~gradientRadius}">
				<<colorStops>>
					<item android:offset="{&offset}" android:color="{&color}" />
				<<colorStops>>
				</gradient>
			<<gradients>>
			</aapt:attr>
		<<fillPattern>>
		</path>
		##render-end:1##
		</group>
		##render-end##
	<<AA>>
	##group-end:0##
	</group>
	##group-end##
<<A>>
</vector>`;