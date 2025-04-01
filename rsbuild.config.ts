import { getImageUrl, getProfile } from "./src/lib/social";
import { pluginModuleFederation } from "@module-federation/rsbuild-plugin";
import { defineConfig } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginNodePolyfill } from "@rsbuild/plugin-node-polyfill";
import { TanStackRouterRspack } from "@tanstack/router-plugin/rspack";
import { normalizeText } from "normalize-text";
import bosConfig from "./bos.config.json";

export default async () => {
  const profile = await getProfile(bosConfig.account);
  const image = getImageUrl(profile?.image);

  return defineConfig({
    html: {
      template: "./index.html",
      title: profile?.name,
      meta: {
        description: profile?.description || "",
      },
      favicon: image,
      inject: "body",
    },
    source: {
      entry: {
        index: "./src/index.tsx",
      },
      define: {
        'process.env.OPEN_CROSSPOST_PROXY_API': JSON.stringify(process.env.OPEN_CROSSPOST_PROXY_API)
      }
    },
    server: {
      port: 5170,
    },
    output: {
      distPath: {
        root: "dist",
      },
      cleanDistPath: true,
      assetPrefix: ".",
    },
    tools: {
      rspack: {
        plugins: [
          TanStackRouterRspack({
            routesDirectory: "./src/routes",
            enableRouteGeneration: true,
          }),
        ],
        module: {
          rules: [
            {
              test: new RegExp(image),
              type: "asset",
              parser: {
                dataUrlCondition: {
                  maxSize: 32 * 1024,
                },
              },
              generator: {
                filename: "favicon.[hash][ext]",
                sizes: [32],
              },
            },
            {
              test: new RegExp(image),
              type: "asset",
              parser: {
                dataUrlCondition: {
                  maxSize: 64 * 1024,
                },
              },
              generator: {
                filename: "logo.[hash][ext]",
                sizes: [80], // 80x80 for the w-20 h-20 logo div
              },
            },
          ],
        },
      },
    },
    plugins: [
      pluginReact(),
      pluginNodePolyfill(),
      // pluginModuleFederation({
      //   name: normalizeText(profile?.name || "app"),
      //   filename: "main/remoteEntry.js", // branch
      //   exposes: {
      //     "./App": "./src/App.tsx",
      //     "./Thing": "./src/App.tsx",
      //     "./View": "./src/components/View.tsx",
      //     "./Template": "./src/components/Template.tsx",
      //     "./Edit": "./src/components/Edit.tsx",
      //   },
      //   experiments: {
      //     federationRuntime: "hoisted",
      //   },
      //   shared: {
      //     react: { singleton: true, eager: true, requiredVersion: "^18.0.0" },
      //     "react-dom": {
      //       singleton: true,
      //       eager: true,
      //       requiredVersion: "^18.0.0",
      //     },
      //     "@tanstack/react-router": { singleton: true, eager: true },
      //   },
      // }),
    ],
  });
};
