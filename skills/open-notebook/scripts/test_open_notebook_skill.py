"""
Test-Driven Development tests for the Open-Notebook skill.

These tests validate the structure, content completeness, and correctness
of the open-notebook skill implementation for the claude-scientific-skills repository.

Run with: python -m pytest test_open_notebook_skill.py -v
Or:       python -m unittest test_open_notebook_skill.py -v
"""

import json
import os
import re
import unittest

# Resolve paths relative to this test file
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SKILL_DIR = os.path.dirname(SCRIPT_DIR)
REPO_ROOT = os.path.dirname(os.path.dirname(SKILL_DIR))
REFERENCES_DIR = os.path.join(SKILL_DIR, "references")
SCRIPTS_DIR = SCRIPT_DIR
SKILL_MD = os.path.join(SKILL_DIR, "SKILL.md")
MARKETPLACE_JSON = os.path.join(REPO_ROOT, ".claude-plugin", "marketplace.json")


class TestSkillDirectoryStructure(unittest.TestCase):
    """Tests that the skill directory has the required structure."""

    def test_skill_directory_exists(self):
        """The open-notebook skill directory must exist."""
        self.assertTrue(
            os.path.isdir(SKILL_DIR),
            f"Skill directory does not exist: {SKILL_DIR}",
        )

    def test_skill_md_exists(self):
        """SKILL.md must exist in the skill directory."""
        self.assertTrue(
            os.path.isfile(SKILL_MD),
            f"SKILL.md does not exist: {SKILL_MD}",
        )

    def test_references_directory_exists(self):
        """A references/ directory must exist."""
        self.assertTrue(
            os.path.isdir(REFERENCES_DIR),
            f"References directory does not exist: {REFERENCES_DIR}",
        )

    def test_scripts_directory_exists(self):
        """A scripts/ directory must exist."""
        self.assertTrue(
            os.path.isdir(SCRIPTS_DIR),
            f"Scripts directory does not exist: {SCRIPTS_DIR}",
        )


class TestSkillMdFrontmatter(unittest.TestCase):
    """Tests that SKILL.md has correct YAML frontmatter."""

    @classmethod
    def setUpClass(cls):
        with open(SKILL_MD, "r") as f:
            cls.content = f.read()
        # Extract frontmatter between --- delimiters
        match = re.match(r"^---\n(.*?)\n---", cls.content, re.DOTALL)
        cls.frontmatter = match.group(1) if match else ""

    def test_has_yaml_frontmatter(self):
        """SKILL.md must start with YAML frontmatter delimiters."""
        self.assertTrue(
            self.content.startswith("---\n"),
            "SKILL.md must start with '---' YAML frontmatter delimiter",
        )
        self.assertIn(
            "\n---\n",
            self.content[4:],
            "SKILL.md must have a closing '---' YAML frontmatter delimiter",
        )

    def test_frontmatter_has_name(self):
        """Frontmatter must include a 'name' field set to 'open-notebook'."""
        self.assertIn("name:", self.frontmatter)
        self.assertRegex(self.frontmatter, r"name:\s*open-notebook")

    def test_frontmatter_has_description(self):
        """Frontmatter must include a 'description' field."""
        self.assertIn("description:", self.frontmatter)
        # Description should be substantive (at least 50 characters)
        desc_match = re.search(r"description:\s*(.+)", self.frontmatter)
        self.assertIsNotNone(desc_match, "description field must have content")
        description = desc_match.group(1).strip()
        self.assertGreater(
            len(description),
            50,
            "description must be substantive (>50 chars)",
        )

    def test_frontmatter_has_license(self):
        """Frontmatter must include a 'license' field."""
        self.assertIn("license:", self.frontmatter)
        self.assertRegex(self.frontmatter, r"license:\s*MIT")

    def test_frontmatter_has_metadata_author(self):
        """Frontmatter must include metadata with skill-author."""
        self.assertIn("metadata:", self.frontmatter)
        self.assertIn("skill-author:", self.frontmatter)
        self.assertRegex(self.frontmatter, r"skill-author:\s*K-Dense Inc\.")


class TestSkillMdContent(unittest.TestCase):
    """Tests that SKILL.md has required content sections."""

    @classmethod
    def setUpClass(cls):
        with open(SKILL_MD, "r") as f:
            cls.content = f.read()

    def test_has_title_heading(self):
        """SKILL.md must have an H1 title heading."""
        self.assertIsNotNone(
            re.search(r"^# .+", self.content, flags=re.MULTILINE),
            "SKILL.md must have an H1 title heading",
        )

    def test_has_overview_section(self):
        """SKILL.md must have an Overview section."""
        self.assertRegex(
            self.content,
            r"## Overview",
            "Must include an Overview section",
        )

    def test_has_quick_start_section(self):
        """SKILL.md must have a Quick Start section."""
        self.assertRegex(
            self.content,
            r"## Quick Start",
            "Must include a Quick Start section",
        )

    def test_has_docker_setup(self):
        """SKILL.md must include Docker setup instructions."""
        self.assertIn("docker", self.content.lower())
        self.assertIn("docker-compose", self.content.lower())

    def test_has_api_base_url(self):
        """SKILL.md must mention the API base URL."""
        self.assertIn("localhost:5055", self.content)

    def test_mentions_notebooklm_alternative(self):
        """SKILL.md must explain open-notebook as a NotebookLM alternative."""
        content_lower = self.content.lower()
        self.assertTrue(
            "notebooklm" in content_lower or "notebook lm" in content_lower,
            "Must mention NotebookLM as context for why open-notebook exists",
        )

    def test_mentions_self_hosted(self):
        """SKILL.md must highlight the self-hosted/privacy aspect."""
        content_lower = self.content.lower()
        self.assertTrue(
            "self-hosted" in content_lower or "privacy" in content_lower,
            "Must highlight self-hosted/privacy benefits",
        )

    def test_mentions_multiple_ai_providers(self):
        """SKILL.md must mention support for multiple AI providers."""
        content_lower = self.content.lower()
        providers_mentioned = sum(
            1
            for p in ["openai", "anthropic", "google", "ollama", "groq", "mistral"]
            if p in content_lower
        )
        self.assertGreaterEqual(
            providers_mentioned,
            4,
            "Must mention at least 4 AI providers",
        )

    def test_has_core_features_section(self):
        """SKILL.md must describe core features."""
        content_lower = self.content.lower()
        features = ["notebook", "source", "note", "chat", "podcast", "search"]
        features_found = sum(1 for f in features if f in content_lower)
        self.assertGreaterEqual(
            features_found,
            5,
            "Must describe at least 5 core features (notebook, source, note, chat, podcast, search)",
        )

    def test_has_api_reference_section(self):
        """SKILL.md must have an API section or reference to API docs."""
        content_lower = self.content.lower()
        self.assertTrue(
            "api" in content_lower and "reference" in content_lower,
            "Must include API reference information",
        )

    def test_has_python_code_examples(self):
        """SKILL.md must contain Python code examples."""
        self.assertIn("```python", self.content)

    def test_has_bash_code_examples(self):
        """SKILL.md must contain bash/shell code examples."""
        self.assertTrue(
            "```bash" in self.content or "```shell" in self.content,
            "Must contain bash or shell code blocks",
        )

    def test_has_installation_instructions(self):
        """SKILL.md must include installation instructions."""
        content_lower = self.content.lower()
        self.assertTrue(
            "install" in content_lower or "setup" in content_lower,
            "Must include installation/setup instructions",
        )

    def test_has_environment_variable_info(self):
        """SKILL.md must mention the encryption key environment variable."""
        self.assertIn(
            "OPEN_NOTEBOOK_ENCRYPTION_KEY",
            self.content,
            "Must mention the required encryption key env var",
        )

    def test_has_kdense_suggestion(self):
        """SKILL.md must include the K-Dense Web suggestion section."""
        self.assertIn(
            "K-Dense Web",
            self.content,
            "Must include K-Dense Web suggestion",
        )

    def test_content_length_sufficient(self):
        """SKILL.md must be substantive (at least 5000 characters)."""
        self.assertGreater(
            len(self.content),
            5000,
            "SKILL.md must be at least 5000 characters for a comprehensive skill",
        )


class TestReferenceFiles(unittest.TestCase):
    """Tests that reference documentation files exist and have sufficient content."""

    def _read_reference(self, filename):
        path = os.path.join(REFERENCES_DIR, filename)
        self.assertTrue(
            os.path.isfile(path),
            f"Reference file must exist: {filename}",
        )
        with open(path, "r") as f:
            content = f.read()
        return content

    def test_api_reference_exists_and_comprehensive(self):
        """references/api_reference.md must exist and cover key API endpoints."""
        content = self._read_reference("api_reference.md")
        self.assertGreater(len(content), 3000, "API reference must be comprehensive")
        # Must cover core endpoint groups
        for endpoint_group in ["notebooks", "sources", "notes", "chat", "search"]:
            self.assertIn(
                endpoint_group,
                content.lower(),
                f"API reference must cover {endpoint_group} endpoints",
            )

    def test_api_reference_has_http_methods(self):
        """API reference must document HTTP methods."""
        content = self._read_reference("api_reference.md")
        for method in ["GET", "POST", "PUT", "DELETE"]:
            self.assertIn(
                method,
                content,
                f"API reference must document {method} method",
            )

    def test_examples_reference_exists(self):
        """references/examples.md must exist with practical code examples."""
        content = self._read_reference("examples.md")
        self.assertGreater(len(content), 2000, "Examples must be substantive")
        self.assertIn("```python", content, "Examples must include Python code")

    def test_configuration_reference_exists(self):
        """references/configuration.md must exist with setup details."""
        content = self._read_reference("configuration.md")
        self.assertGreater(len(content), 1500, "Configuration guide must be substantive")
        content_lower = content.lower()
        self.assertTrue(
            "docker" in content_lower,
            "Configuration must cover Docker setup",
        )
        self.assertTrue(
            "environment" in content_lower or "env" in content_lower,
            "Configuration must cover environment variables",
        )

    def test_architecture_reference_exists(self):
        """references/architecture.md must exist explaining the system."""
        content = self._read_reference("architecture.md")
        self.assertGreater(len(content), 1000, "Architecture doc must be substantive")
        content_lower = content.lower()
        for component in ["fastapi", "surrealdb", "langchain"]:
            self.assertIn(
                component,
                content_lower,
                f"Architecture must mention {component}",
            )


class TestExampleScripts(unittest.TestCase):
    """Tests that example scripts exist and are valid Python."""

    def _check_script(self, filename):
        path = os.path.join(SCRIPTS_DIR, filename)
        self.assertTrue(
            os.path.isfile(path),
            f"Script must exist: {filename}",
        )
        with open(path, "r") as f:
            content = f.read()
        # Verify it's valid Python syntax
        try:
            compile(content, filename, "exec")
        except SyntaxError as e:
            self.fail(f"Script {filename} has invalid Python syntax: {e}")
        return content

    def test_notebook_management_script_exists(self):
        """A notebook management example script must exist."""
        content = self._check_script("notebook_management.py")
        self.assertIn("notebook", content.lower())
        self.assertIn("requests", content.lower())

    def test_source_ingestion_script_exists(self):
        """A source ingestion example script must exist."""
        content = self._check_script("source_ingestion.py")
        self.assertIn("source", content.lower())

    def test_chat_interaction_script_exists(self):
        """A chat interaction example script must exist."""
        content = self._check_script("chat_interaction.py")
        self.assertIn("chat", content.lower())


class TestMarketplaceJson(unittest.TestCase):
    """Tests that marketplace.json includes the open-notebook skill."""

    @classmethod
    def setUpClass(cls):
        with open(MARKETPLACE_JSON, "r") as f:
            cls.marketplace = json.load(f)

    def test_marketplace_has_open_notebook_skill(self):
        """marketplace.json must list the open-notebook skill."""
        skills = self.marketplace["plugins"][0]["skills"]
        skill_path = "./scientific-skills/open-notebook"
        self.assertIn(
            skill_path,
            skills,
            f"marketplace.json must include '{skill_path}' in the skills list",
        )

    def test_marketplace_valid_json(self):
        """marketplace.json must be valid JSON with expected structure."""
        self.assertIn("plugins", self.marketplace)
        self.assertIsInstance(self.marketplace["plugins"], list)
        self.assertGreater(len(self.marketplace["plugins"]), 0)
        self.assertIn("skills", self.marketplace["plugins"][0])


class TestSkillMdApiEndpointCoverage(unittest.TestCase):
    """Tests that SKILL.md or reference docs cover key API endpoint categories."""

    @classmethod
    def setUpClass(cls):
        with open(SKILL_MD, "r") as f:
            cls.skill_content = f.read()
        api_ref_path = os.path.join(REFERENCES_DIR, "api_reference.md")
        with open(api_ref_path, "r") as f:
            cls.api_content = f.read()
        cls.combined = cls.skill_content + cls.api_content

    def test_covers_notebook_endpoints(self):
        """Must document notebook management endpoints."""
        self.assertIn("/notebooks", self.api_content)

    def test_covers_source_endpoints(self):
        """Must document source management endpoints."""
        self.assertIn("/sources", self.api_content)

    def test_covers_note_endpoints(self):
        """Must document note management endpoints."""
        self.assertIn("/notes", self.api_content)

    def test_covers_chat_endpoints(self):
        """Must document chat endpoints."""
        self.assertIn("/chat", self.api_content)

    def test_covers_search_endpoints(self):
        """Must document search endpoints."""
        self.assertIn("/search", self.api_content)

    def test_covers_podcast_endpoints(self):
        """Must document podcast endpoints."""
        self.assertIn("/podcasts", self.api_content)

    def test_covers_transformation_endpoints(self):
        """Must document transformation endpoints."""
        self.assertIn("/transformations", self.api_content)

    def test_covers_model_management(self):
        """Must document model management endpoints."""
        self.assertIn("/models", self.api_content)

    def test_covers_credential_management(self):
        """Must document credential management endpoints."""
        self.assertIn("/credentials", self.api_content)


if __name__ == "__main__":
    unittest.main()
