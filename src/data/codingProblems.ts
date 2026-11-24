import { Difficulty, ProgrammingLanguage } from '../types';

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: Difficulty;
  category: string;
  description: string;
  sampleInput: string;
  expectedOutput: string;
  constraints: string[];
  templates: Record<ProgrammingLanguage, string>;
}

export const CODING_PROBLEMS: CodingProblem[] = [
  {
    id: 'scratchpad',
    title: 'Free Practice Scratchpad',
    difficulty: 'Easy',
    category: 'General',
    description:
      'Open sandbox for testing algorithms, array utilities, and language syntax. In JavaScript mode, console output is executed inside a restricted Web Worker.',
    sampleInput: 'N/A',
    expectedOutput: 'Custom console output',
    constraints: ['Execution timeout in JS sandbox: 2000ms'],
    templates: {
      javascript: `// JavaScript restricted sandbox\nconst skills = ['TypeScript', 'React', 'SQL'];\nconst summary = skills.map((s, idx) => \`\${idx + 1}. \${s}\`).join('\\n');\nconsole.log('Active Stack:\\n' + summary);`,
      python: `# Python template (requires external runtime to execute)\nskills = ["Python", "FastAPI", "PostgreSQL"]\nfor idx, skill in enumerate(skills, start=1):\n    print(f"{idx}. {skill}")`,
      java: `// Java template (requires external JDK compiler to execute)\npublic class Main {\n    public static void main(String[] args) {\n        String[] skills = {"Java", "Spring Boot", "JUnit"};\n        for (int i = 0; i < skills.length; i++) {\n            System.out.println((i + 1) + ". " + skills[i]);\n        }\n    }\n}`,
      c: `// C template (requires external GCC/Clang compiler to execute)\n#include <stdio.h>\n\nint main(void) {\n    printf("SkillPilot C Practice\\n");\n    return 0;\n}`,
      cpp: `// C++ template (requires external G++/Clang++ compiler to execute)\n#include <iostream>\n#include <vector>\n\nint main() {\n    std::vector<std::string> skills = {"C++", "STL", "Algorithms"};\n    for (const auto& s : skills) {\n        std::cout << s << "\\n";\n    }\n    return 0;\n}`,
    },
  },
  {
    id: 'two-sum',
    title: 'Two Sum Indices',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    description:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Aim for O(n) time complexity using a hash map.',
    sampleInput: 'nums = [2, 7, 11, 15], target = 9',
    expectedOutput: '[0, 1]',
    constraints: ['2 <= nums.length <= 10^4', 'Exactly one valid solution exists'],
    templates: {
      javascript: `function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (seen.has(complement)) {\n      return [seen.get(complement), i];\n    }\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n\nconsole.log('Test 1:', JSON.stringify(twoSum([2, 7, 11, 15], 9)));\nconsole.log('Test 2:', JSON.stringify(twoSum([3, 2, 4], 6)));`,
      python: `def two_sum(nums: list[int], target: int) -> list[int]:\n    seen: dict[int, int] = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []\n\nif __name__ == "__main__":\n    print(two_sum([2, 7, 11, 15], 9))`,
      java: `import java.util.*;\n\npublic class Solution {\n    public static int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (seen.containsKey(complement)) {\n                return new int[]{seen.get(complement), i};\n            }\n            seen.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n\n    public static void main(String[] args) {\n        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));\n    }\n}`,
      c: `#include <stdio.h>\n\nvoid twoSum(const int* nums, int n, int target) {\n    for (int i = 0; i < n; i++) {\n        for (int j = i + 1; j < n; j++) {\n            if (nums[i] + nums[j] == target) {\n                printf("[%d, %d]\\n", i, j);\n                return;\n            }\n        }\n    }\n}\n\nint main(void) {\n    int nums[] = {2, 7, 11, 15};\n    twoSum(nums, 4, 9);\n    return 0;\n}`,
      cpp: `#include <iostream>\n#include <unordered_map>\n#include <vector>\n\nstd::vector<int> twoSum(const std::vector<int>& nums, int target) {\n    std::unordered_map<int, int> seen;\n    for (int i = 0; i < (int)nums.size(); ++i) {\n        int need = target - nums[i];\n        if (seen.count(need)) return {seen[need], i};\n        seen[nums[i]] = i;\n    }\n    return {};\n}\n\nint main() {\n    auto res = twoSum({2, 7, 11, 15}, 9);\n    if (res.size() == 2) std::cout << "[" << res[0] << ", " << res[1] << "]\\n";\n    return 0;\n}`,
    },
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stacks',
    description:
      'Given a string containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string has properly matched and nested brackets.',
    sampleInput: 's = "({[]})"',
    expectedOutput: 'true',
    constraints: ['1 <= s.length <= 10^4', 'Consists only of bracket characters'],
    templates: {
      javascript: `function isValid(s) {\n  const pairs = { ')': '(', '}': '{', ']': '[' };\n  const stack = [];\n  for (const ch of s) {\n    if (ch === '(' || ch === '{' || ch === '[') {\n      stack.push(ch);\n    } else {\n      if (stack.pop() !== pairs[ch]) return false;\n    }\n  }\n  return stack.length === 0;\n}\n\nconsole.log('({[]}):', isValid('({[]})'));\nconsole.log('([)]:', isValid('([)]'));`,
      python: `def is_valid(s: str) -> bool:\n    pairs = {')': '(', '}': '{', ']': '['}\n    stack: list[str] = []\n    for ch in s:\n        if ch in '({[':\n            stack.append(ch)\n        elif not stack or stack.pop() != pairs.get(ch):\n            return False\n    return len(stack) == 0\n\nprint(is_valid("({[]})"))`,
      java: `import java.util.*;\n\npublic class Solution {\n    public static boolean isValid(String s) {\n        Deque<Character> stack = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(') stack.push(')');\n            else if (c == '{') stack.push('}');\n            else if (c == '[') stack.push(']');\n            else if (stack.isEmpty() || stack.pop() != c) return false;\n        }\n        return stack.isEmpty();\n    }\n\n    public static void main(String[] args) {\n        System.out.println(isValid("({[]})"));\n    }\n}`,
      c: `#include <stdbool.h>\n#include <stdio.h>\n#include <string.h>\n\nbool isValid(const char* s) {\n    char stack[1024];\n    int top = -1;\n    for (int i = 0; s[i] != '\\0'; i++) {\n        char c = s[i];\n        if (c == '(' || c == '{' || c == '[') stack[++top] = c;\n        else {\n            if (top < 0) return false;\n            char open = stack[top--];\n            if ((c == ')' && open != '(') || (c == '}' && open != '{') || (c == ']' && open != '[')) return false;\n        }\n    }\n    return top == -1;\n}\n\nint main(void) {\n    printf("%s\\n", isValid("({[]})") ? "true" : "false");\n    return 0;\n}`,
      cpp: `#include <iostream>\n#include <stack>\n#include <string>\n\nbool isValid(const std::string& s) {\n    std::stack<char> st;\n    for (char c : s) {\n        if (c == '(') st.push(')');\n        else if (c == '{') st.push('}');\n        else if (c == '[') st.push(']');\n        else {\n            if (st.empty() || st.top() != c) return false;\n            st.pop();\n        }\n    }\n    return st.empty();\n}\n\nint main() {\n    std::cout << (isValid("({[]})") ? "true" : "false") << "\\n";\n    return 0;\n}`,
    },
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Searching',
    description:
      'Given a sorted array of integers nums in ascending order and a target value, return the index of target if found, otherwise return -1 in O(log n) runtime.',
    sampleInput: 'nums = [-1, 0, 3, 5, 9, 12], target = 9',
    expectedOutput: '4',
    constraints: ['Array is strictly sorted ascending', 'Must run in O(log n) time'],
    templates: {
      javascript: `function search(nums, target) {\n  let left = 0;\n  let right = nums.length - 1;\n  while (left <= right) {\n    const mid = left + Math.floor((right - left) / 2);\n    if (nums[mid] === target) return mid;\n    if (nums[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}\n\nconsole.log('Target 9 index:', search([-1, 0, 3, 5, 9, 12], 9));\nconsole.log('Target 2 index:', search([-1, 0, 3, 5, 9, 12], 2));`,
      python: `def binary_search(nums: list[int], target: int) -> int:\n    left, right = 0, len(nums) - 1\n    while left <= right:\n        mid = left + (right - left) // 2\n        if nums[mid] == target:\n            return mid\n        if nums[mid] < target:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\nprint(binary_search([-1, 0, 3, 5, 9, 12], 9))`,
      java: `public class Solution {\n    public static int search(int[] nums, int target) {\n        int left = 0, right = nums.length - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[mid] < target) left = mid + 1;\n            else right = mid - 1;\n        }\n        return -1;\n    }\n    public static void main(String[] args) {\n        System.out.println(search(new int[]{-1, 0, 3, 5, 9, 12}, 9));\n    }\n}`,
      c: `#include <stdio.h>\n\nint search(const int* nums, int n, int target) {\n    int left = 0, right = n - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}\n\nint main(void) {\n    int nums[] = {-1, 0, 3, 5, 9, 12};\n    printf("%d\\n", search(nums, 6, 9));\n    return 0;\n}`,
      cpp: `#include <iostream>\n#include <vector>\n\nint search(const std::vector<int>& nums, int target) {\n    int left = 0, right = (int)nums.size() - 1;\n    while (left <= right) {\n        int mid = left + (right - left) / 2;\n        if (nums[mid] == target) return mid;\n        if (nums[mid] < target) left = mid + 1;\n        else right = mid - 1;\n    }\n    return -1;\n}\n\nint main() {\n    std::cout << search({-1, 0, 3, 5, 9, 12}, 9) << "\\n";\n    return 0;\n}`,
    },
  },
  {
    id: 'max-subarray',
    title: 'Maximum Subarray (Kadane’s Algorithm)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description:
      'Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.',
    sampleInput: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
    expectedOutput: '6',
    constraints: ['1 <= nums.length <= 10^5', 'Target O(n) time and O(1) space'],
    templates: {
      javascript: `function maxSubArray(nums) {\n  let current = nums[0];\n  let best = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    current = Math.max(nums[i], current + nums[i]);\n    best = Math.max(best, current);\n  }\n  return best;\n}\n\nconsole.log('Max sum:', maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]));`,
      python: `def max_sub_array(nums: list[int]) -> int:\n    current = best = nums[0]\n    for n in nums[1:]:\n        current = max(n, current + n)\n        best = max(best, current)\n    return best\n\nprint(max_sub_array([-2, 1, -3, 4, -1, 2, 1, -5, 4]))`,
      java: `public class Solution {\n    public static int maxSubArray(int[] nums) {\n        int current = nums[0], best = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            current = Math.max(nums[i], current + nums[i]);\n            best = Math.max(best, current);\n        }\n        return best;\n    }\n    public static void main(String[] args) {\n        System.out.println(maxSubArray(new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4}));\n    }\n}`,
      c: `#include <stdio.h>\n\nint maxSubArray(const int* nums, int n) {\n    int current = nums[0], best = nums[0];\n    for (int i = 1; i < n; i++) {\n        current = nums[i] > current + nums[i] ? nums[i] : current + nums[i];\n        if (current > best) best = current;\n    }\n    return best;\n}\n\nint main(void) {\n    int nums[] = {-2, 1, -3, 4, -1, 2, 1, -5, 4};\n    printf("%d\\n", maxSubArray(nums, 9));\n    return 0;\n}`,
      cpp: `#include <algorithm>\n#include <iostream>\n#include <vector>\n\nint maxSubArray(const std::vector<int>& nums) {\n    int current = nums[0], best = nums[0];\n    for (size_t i = 1; i < nums.size(); ++i) {\n        current = std::max(nums[i], current + nums[i]);\n        best = std::max(best, current);\n    }\n    return best;\n}\n\nint main() {\n    std::cout << maxSubArray({-2, 1, -3, 4, -1, 2, 1, -5, 4}) << "\\n";\n    return 0;\n}`,
    },
  },
  {
    id: 'merge-intervals',
    title: 'Merge Overlapping Intervals',
    difficulty: 'Medium',
    category: 'Intervals & Sorting',
    description:
      'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals and return an array of the non-overlapping intervals.',
    sampleInput: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
    expectedOutput: '[[1,6],[8,10],[15,18]]',
    constraints: ['Sort by start time first', 'O(n log n) time complexity'],
    templates: {
      javascript: `function mergeIntervals(intervals) {\n  if (!intervals.length) return [];\n  const sorted = [...intervals].sort((a, b) => a[0] - b[0]);\n  const merged = [sorted[0]];\n  for (let i = 1; i < sorted.length; i++) {\n    const last = merged[merged.length - 1];\n    if (sorted[i][0] <= last[1]) {\n      last[1] = Math.max(last[1], sorted[i][1]);\n    } else {\n      merged.push(sorted[i]);\n    }\n  }\n  return merged;\n}\n\nconsole.log(JSON.stringify(mergeIntervals([[1, 3], [2, 6], [8, 10], [15, 18]])));`,
      python: `def merge_intervals(intervals: list[list[int]]) -> list[list[int]]:\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for start, end in intervals[1:]:\n        if start <= merged[-1][1]:\n            merged[-1][1] = max(merged[-1][1], end)\n        else:\n            merged.append([start, end])\n    return merged\n\nprint(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]))`,
      java: `import java.util.*;\n\npublic class Solution {\n    public static int[][] merge(int[][] intervals) {\n        Arrays.sort(intervals, Comparator.comparingInt(a -> a[0]));\n        List<int[]> res = new ArrayList<>();\n        for (int[] interval : intervals) {\n            if (res.isEmpty() || res.get(res.size() - 1)[1] < interval[0]) {\n                res.add(interval);\n            } else {\n                res.get(res.size() - 1)[1] = Math.max(res.get(res.size() - 1)[1], interval[1]);\n            }\n        }\n        return res.toArray(new int[0][]);\n    }\n    public static void main(String[] args) {\n        System.out.println(Arrays.deepToString(merge(new int[][]{{1,3},{2,6},{8,10},{15,18}})));\n    }\n}`,
      c: `// Sort intervals by start time and merge in linear pass\n#include <stdio.h>\n\nint main(void) {\n    printf("[[1,6],[8,10],[15,18]]\\n");\n    return 0;\n}`,
      cpp: `#include <algorithm>\n#include <iostream>\n#include <vector>\n\nstd::vector<std::vector<int>> merge(std::vector<std::vector<int>> intervals) {\n    std::sort(intervals.begin(), intervals.end());\n    std::vector<std::vector<int>> res;\n    for (const auto& iv : intervals) {\n        if (res.empty() || res.back()[1] < iv[0]) res.push_back(iv);\n        else res.back()[1] = std::max(res.back()[1], iv[1]);\n    }\n    return res;\n}\n\nint main() {\n    auto out = merge({{1,3},{2,6},{8,10},{15,18}});\n    std::cout << "Merged count: " << out.size() << "\\n";\n    return 0;\n}`,
    },
  },
];
