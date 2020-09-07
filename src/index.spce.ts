import * as util from "util";
import SnapshotHistory from "./index";
import { gte } from "semver";

/**
 * Dynamically generate the entire test suite.
 */
describe("snapshot-history", function () {
  const TEST_PATH = "/user/:id";

  const TEST_PARAM = {
    name: "id",
    prefix: "/",
    suffix: "",
    modifier: "",
    pattern: "[^\\/#\\?]+?",
  };

  describe("arguments", function () {
    it("should work without different call combinations", function () {
      expect(111).toEqual(111);
    });

    it("should accept an array of keys as the second argument", function () {});

    it("should throw on non-capturing pattern", function () {});
  });
});
